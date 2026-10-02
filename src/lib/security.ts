import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { databaseUrl } from "@/lib/db";
import { dataDir, isServerless } from "@/lib/runtime";

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

/**
 * Signing key. With an external database it's derived from DATABASE_URL (which holds the database
 * password, so it is just as secret). Otherwise a random key is created once in the data directory.
 */
let cachedSecret: string | undefined;
function secret() {
  if (cachedSecret) return cachedSecret;
  const db = databaseUrl();
  if (db) return (cachedSecret = createHash("sha256").update(`orc-session-v1:${db}`).digest("base64url"));
  if (isServerless()) throw new Error("DATABASE_URL is not set.");
  const file = path.join(dataDir(), "secret.key");
  try {
    cachedSecret = readFileSync(file, "utf8").trim();
  } catch {
    mkdirSync(dataDir(), { recursive: true });
    const fresh = randomBytes(48).toString("base64url");
    try {
      writeFileSync(file, fresh, { mode: 0o600, flag: "wx" });
      cachedSecret = fresh;
    } catch {
      cachedSecret = readFileSync(file, "utf8").trim(); // another worker created it first
    }
  }
  return cachedSecret;
}

// ---------- Passwords ----------

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password.normalize("NFKC"), salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scryptAsync(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

// ---------- Order codes and customer passwords ----------

// No 0/O, 1/I/L: easy to read out over the phone and type from an email.
const READABLE = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function readable(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) out += READABLE[randomInt(READABLE.length)];
  return out;
}

export function newOrderCode() {
  return `ORC-${readable(4)}-${readable(4)}`;
}

export function newOrderPassword() {
  return `${readable(4)}-${readable(4)}-${readable(4)}`.toLowerCase();
}

export function normaliseOrderCode(input: string) {
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = clean.startsWith("ORC") ? clean.slice(3) : clean;
  return body.length === 8 ? `ORC-${body.slice(0, 4)}-${body.slice(4)}` : input.trim().toUpperCase();
}

// ---------- Sealing (short-lived encrypted values) ----------

function sealKey() {
  return createHmac("sha256", secret()).update("seal-v1").digest();
}

export function seal(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sealKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function unseal(sealed: string) {
  const [iv, tag, data] = sealed.split(".").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", sealKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

// ---------- Signed session tokens ----------

export function signToken(payload: Record<string, unknown>, ttlSeconds: number) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken<T extends Record<string, unknown>>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T & { exp: number };
    return payload.exp > Date.now() / 1000 ? payload : null;
  } catch {
    return null;
  }
}

/** HMAC of `value` under the session secret: lets us compare a value without storing it. */
export function keyedDigest(label: string, value: string) {
  return createHmac("sha256", secret()).update(`${label}:${value}`).digest("base64url");
}

export function safeEqual(a: string, b: string) {
  const x = createHmac("sha256", "cmp").update(a).digest();
  const y = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(x, y);
}

// ---------- TOTP (RFC 6238), for the admin's authenticator app ----------

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function newTotpSecret() {
  const bytes = randomBytes(20);
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) out += BASE32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}

function base32Decode(input: string) {
  let bits = "";
  for (const ch of input.replace(/=+$/, "").toUpperCase()) {
    const v = BASE32.indexOf(ch);
    if (v >= 0) bits += v.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function totpAt(secretB32: string, counter: number) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", base32Decode(secretB32)).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return code.toString().padStart(6, "0");
}

/** Accepts the current code and one step either side, to allow for clock drift. */
export function verifyTotp(secretB32: string, code: string) {
  const clean = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  const counter = Math.floor(Date.now() / 30_000);
  return [-1, 0, 1].some((d) => safeEqual(totpAt(secretB32, counter + d), clean));
}

export function totpUri(secretB32: string, account: string) {
  const issuer = "Old Red Chisel";
  return `otpauth://totp/${encodeURIComponent(`${issuer}:${account}`)}?secret=${secretB32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

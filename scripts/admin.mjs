#!/usr/bin/env node
// Opens the admin panel: `npm run admin`
//
// Makes a one-time pass (valid for 2 minutes) signed with ADMIN_ACCESS_KEY and opens the
// browser on the secret admin address with it. Without such a pass the address shows 404.
//
// Reads ADMIN_SITE_URL, ADMIN_PATH and ADMIN_ACCESS_KEY from the environment or from a
// `.env.admin` file next to package.json (never commit it). `npm run admin -- --print`
// prints the link instead of opening the browser.

import { createHmac, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = join(root, ".env.admin");
const fileEnv = {};
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m) fileEnv[m[1]] = m[2];
  }
}
const get = (k) => process.env[k] || fileEnv[k] || "";

const site = get("ADMIN_SITE_URL").replace(/\/+$/, "");
const path = get("ADMIN_PATH").replace(/^\/+|\/+$/g, "");
const key = get("ADMIN_ACCESS_KEY");

if (!site || !path || key.length < 32) {
  console.error(`Missing settings. Create ${envFile} with:

ADMIN_SITE_URL=https://oldredchisel.vercel.app
ADMIN_PATH=<the same secret path as in Vercel>
ADMIN_ACCESS_KEY=<the same 32+ character key as in Vercel>`);
  process.exit(1);
}

const body = Buffer.from(JSON.stringify({ t: Math.floor(Date.now() / 1000), n: randomBytes(18).toString("base64url") })).toString("base64url");
const sig = createHmac("sha256", key).update(body).digest("base64url");
const url = `${site}/${path}/enter?ticket=${body}.${sig}`;

if (process.argv.includes("--print")) {
  console.log(url);
} else {
  const opener = process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : [process.platform === "darwin" ? "open" : "xdg-open", [url]];
  spawn(opener[0], opener[1], { stdio: "ignore", detached: true }).unref();
  console.log("Opening the admin panel in your browser (the link works once, for 2 minutes).");
}

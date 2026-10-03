import "server-only";
import path from "node:path";

// Where the site keeps its own files when it runs on an ordinary server (VPS or any host with a
// disk that survives restarts): the embedded database, uploaded photos and the signing key.
export function dataDir() {
  return path.resolve(process.env.DATA_DIR || ".data");
}

/**
 * Serverless hosts (Vercel, Netlify, AWS Lambda) don't keep files written at runtime, so there the
 * site needs an external database (DATABASE_URL) and photo storage (BLOB_READ_WRITE_TOKEN).
 * Everywhere else the data directory above is used.
 */
export function isServerless() {
  return Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

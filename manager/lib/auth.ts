const encoder = new TextEncoder();
export const SESSION_COOKIE = "gyulrose_manager";

function constantTimeEqual(a: string, b: string) {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  if (left.length !== right.length) return false;
  let result = 0;
  for (let i = 0; i < left.length; i += 1) result |= left[i] ^ right[i];
  return result === 0;
}

async function signature(payload: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
  return Buffer.from(bytes).toString("base64url");
}

export async function createSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })).toString("base64url");
  return `${payload}.${await signature(payload)}`;
}

export async function verifySession(value?: string) {
  if (!value) return false;
  const [payload, supplied] = value.split(".");
  if (!payload || !supplied || !constantTimeEqual(await signature(payload), supplied)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function passwordMatches(value: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected && value.length >= 12 && constantTimeEqual(value, expected));
}

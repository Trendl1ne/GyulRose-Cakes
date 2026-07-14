import { NextResponse } from "next/server";
import { createSession, passwordMatches, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !passwordMatches(password)) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSession(), { httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return response;
}

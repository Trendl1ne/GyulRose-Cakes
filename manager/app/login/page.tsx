"use client";
import { FormEvent, useState } from "react";

export default function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: form.get("password") }) });
    if (response.ok) location.href = "/";
    else { setError("That password is not correct."); setBusy(false); }
  }
  return <main className="login-shell"><section className="login-card"><div className="brand-mark">GR</div><p className="eyebrow">Private owner access</p><h1>GyulRose Cake Manager</h1><p>Add and remove cakes from the live website without opening GitHub.</p><form onSubmit={submit}><label>Password<input name="password" type="password" minLength={12} autoComplete="current-password" required autoFocus /></label><button disabled={busy}>{busy ? "Signing in…" : "Open cake manager"}</button>{error && <p className="error" role="alert">{error}</p>}</form></section></main>;
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;

  const ok =
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD;

  if (!ok) return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });

  return NextResponse.json({ ok: true });
}

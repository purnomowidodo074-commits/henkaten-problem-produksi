import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

function isAuthorized(username: string, password: string) {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

function unauthorized() {
  return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
}

export async function GET() {
  const { data, error } = await insforge.database.from("settings_options").select("*").order("id", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const lines = rows.filter((r) => r.type === "line").map((r) => ({ id: r.id, value: r.value }));
  const pics = rows.filter((r) => r.type === "pic").map((r) => ({ id: r.id, value: r.value }));

  return NextResponse.json({ lines, pics });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password, type, value } = body;

  if (!isAuthorized(username, password)) return unauthorized();
  if (type !== "line" && type !== "pic") {
    return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 });
  }

  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return NextResponse.json({ error: "Nilai tidak boleh kosong" }, { status: 400 });

  const { data: existing } = await insforge.database
    .from("settings_options")
    .select("id")
    .eq("type", type)
    .eq("value", trimmed);
  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Nilai sudah ada" }, { status: 409 });
  }

  const { data, error } = await insforge.database.from("settings_options").insert([{ type, value: trimmed }]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data?.[0] ?? data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { username, password, id } = body;

  if (!isAuthorized(username, password)) return unauthorized();
  if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  const { error } = await insforge.database.from("settings_options").delete().eq("id", Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

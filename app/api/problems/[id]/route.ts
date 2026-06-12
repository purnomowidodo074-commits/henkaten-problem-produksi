import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status, planningPerbaikan, rencanaPerbaikan, keterangan, picPerbaikan } = body;

  const data: Record<string, string> = {};
  if (status !== undefined) data.status = status;
  if (planningPerbaikan !== undefined) data.planningPerbaikan = planningPerbaikan;
  if (rencanaPerbaikan !== undefined) data["rencanaperbaikan"] = rencanaPerbaikan;
  if (keterangan !== undefined) data.keterangan = keterangan;
  if (picPerbaikan !== undefined) data.picPerbaikan = picPerbaikan;

  const { data: updated, error } = await insforge.database
    .from("problems")
    .update(data)
    .eq("id", Number(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(updated?.[0] ?? updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await insforge.database
    .from("problems")
    .delete()
    .eq("id", Number(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

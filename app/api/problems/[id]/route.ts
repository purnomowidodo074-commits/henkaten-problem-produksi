import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status, planningPerbaikan, keterangan } = body;

  const data: Record<string, string> = {};
  if (status !== undefined) data.status = status;
  if (planningPerbaikan !== undefined) data.planningPerbaikan = planningPerbaikan;
  if (keterangan !== undefined) data.keterangan = keterangan;

  const updated = await prisma.problem.update({
    where: { id: Number(id) },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.problem.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

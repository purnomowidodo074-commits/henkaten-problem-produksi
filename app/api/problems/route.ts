import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const line = searchParams.get("line");
  const jenisProblem = searchParams.get("jenisProblem");
  const month = searchParams.get("month"); // format: YYYY-MM

  const where: Record<string, unknown> = {};
  if (line) where.line = line;
  if (jenisProblem) where.jenisProblem = jenisProblem;
  if (month) {
    const [year, m] = month.split("-").map(Number);
    where.date = {
      gte: new Date(year, m - 1, 1),
      lt: new Date(year, m, 1),
    };
  }

  const problems = await prisma.problem.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(problems);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, line, jenisProblem, problem, namaMesin } = body;

  if (!line || !jenisProblem || !problem || !namaMesin) {
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }

  const record = await prisma.problem.create({
    data: {
      date: date ? new Date(date) : new Date(),
      line,
      jenisProblem,
      problem,
      namaMesin,
    },
  });

  return NextResponse.json(record, { status: 201 });
}

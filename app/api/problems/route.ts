import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const line = searchParams.get("line");
  const jenisProblem = searchParams.get("jenisProblem");
  const month = searchParams.get("month"); // format: YYYY-MM
  const status = searchParams.get("status");

  let query = insforge.database.from("problems").select("*").order("createdAt", { ascending: false });

  if (line) query = query.eq("line", line);
  if (jenisProblem) query = query.eq("jenisProblem", jenisProblem);
  if (status) query = query.eq("status", status);
  if (month) {
    const [year, m] = month.split("-").map(Number);
    const start = new Date(year, m - 1, 1).toISOString();
    const end = new Date(year, m, 1).toISOString();
    query = query.gte("date", start).lt("date", end);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped = (data ?? []).map((row: any) => ({
    ...row,
    rencanaPerbaikan: row.rencanaperbaikan ?? "",
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, line, jenisProblem, problem, namaMesin, picPerbaikan } = body;

  if (!line || !jenisProblem || !problem || !namaMesin) {
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }

  const { data, error } = await insforge.database.from("problems").insert([
    {
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      line,
      jenisProblem,
      problem,
      namaMesin,
      picPerbaikan: picPerbaikan ?? "",
    },
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data?.[0] ?? data, { status: 201 });
}

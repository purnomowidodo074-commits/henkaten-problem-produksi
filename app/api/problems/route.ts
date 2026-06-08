import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const line = searchParams.get("line");
  const jenisProblem = searchParams.get("jenisProblem");
  const month = searchParams.get("month"); // format: YYYY-MM

  let query = insforge.database.from("problems").select("*").order("date", { ascending: false });

  if (line) query = query.eq("line", line);
  if (jenisProblem) query = query.eq("jenisProblem", jenisProblem);
  if (month) {
    const [year, m] = month.split("-").map(Number);
    const start = new Date(year, m - 1, 1).toISOString();
    const end = new Date(year, m, 1).toISOString();
    query = query.gte("date", start).lt("date", end);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, line, jenisProblem, problem, namaMesin } = body;

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
    },
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data?.[0] ?? data, { status: 201 });
}

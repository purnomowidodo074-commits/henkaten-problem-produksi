import Link from "next/link";
import { insforge } from "@/lib/insforge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import MonthlyChart from "@/components/MonthlyChart";
import ProblemTable from "@/components/ProblemTable";

export const dynamic = "force-dynamic";

async function getData() {
  const { data: allProblems } = await insforge.database
    .from("problems")
    .select("*")
    .order("createdAt", { ascending: false });

  const problems = allProblems ?? [];
  const now = new Date();
  const currentYear = now.getFullYear();

  const thisMonth = problems.filter((p) => {
    const d = new Date(p.date);
    return d.getFullYear() === currentYear && d.getMonth() === now.getMonth();
  });

  const dataMap: Record<string, { onProgress: number; finish: number }> = {};
  problems.forEach((p) => {
    const d = new Date(p.date);
    if (d.getFullYear() !== currentYear) return;
    const key = format(d, "MMM", { locale: id });
    if (!dataMap[key]) dataMap[key] = { onProgress: 0, finish: 0 };
    if (p.status === "On progress") dataMap[key].onProgress++;
    else dataMap[key].finish++;
  });

  const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const chartData = MONTHS_ID.map((m) => ({
    month: m,
    onProgress: dataMap[m]?.onProgress ?? 0,
    finish: dataMap[m]?.finish ?? 0,
  }));

  return {
    totalBulanIni: thisMonth.length,
    onProgress: problems.filter((p) => p.status === "On progress").length,
    finish: problems.filter((p) => p.status === "Finish").length,
    chartData,
    allProblems: problems,
  };
}

export default async function DashboardPage() {
  const { totalBulanIni, onProgress, finish, chartData, allProblems } = await getData();

  const kpis = [
    {
      label: "Total Problem Bulan Ini",
      value: totalBulanIni,
      color: "bg-slate-800",
      href: null,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: "On Progress",
      value: onProgress,
      color: "bg-amber-500",
      href: "/data?status=On+progress",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Finish",
      value: finish,
      color: "bg-emerald-500",
      href: "/data?status=Finish",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Rekapitulasi Henkaten &amp; Problem Produksi &mdash;{" "}
          {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const inner = (
            <>
              <div className={`${kpi.color} text-white rounded-lg p-3 flex-shrink-0`}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
              </div>
            </>
          );
          return kpi.href ? (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:border-slate-300 hover:shadow-md transition-all"
            >
              {inner}
            </Link>
          ) : (
            <div key={kpi.label} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              {inner}
            </div>
          );
        })}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Rekapitulasi Bulanan</h2>
        <MonthlyChart data={chartData} />
      </div>

      {/* All Problems with month filter */}
      <ProblemTable problems={allProblems} />
    </div>
  );
}

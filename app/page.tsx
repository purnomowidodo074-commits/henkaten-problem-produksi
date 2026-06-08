import { insforge } from "@/lib/insforge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import MonthlyChart from "@/components/MonthlyChart";

export const dynamic = "force-dynamic";

async function getData() {
  const { data: allProblems } = await insforge.database
    .from("problems")
    .select("*")
    .order("date", { ascending: false });

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
    recent: problems.slice(0, 5),
  };
}

export default async function DashboardPage() {
  const { totalBulanIni, onProgress, finish, chartData, recent } = await getData();

  const kpis = [
    {
      label: "Total Problem Bulan Ini",
      value: totalBulanIni,
      color: "bg-slate-800",
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
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`${kpi.color} text-white rounded-lg p-3 flex-shrink-0`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Rekapitulasi Bulanan</h2>
        <MonthlyChart data={chartData} />
      </div>

      {/* Recent Problems */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Problem Terbaru</h2>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Belum ada data problem</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Tanggal", "Line", "Jenis", "Problem", "Nama Mesin", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((p) => (
                  <tr
                    key={p.id}
                    className={p.status === "On progress" ? "bg-yellow-50" : "bg-white"}
                  >
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap text-xs">
                      {format(new Date(p.date), "dd/MM/yyyy")}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap text-xs font-medium">{p.line}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {p.jenisProblem}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 text-xs max-w-xs truncate">{p.problem}</td>
                    <td className="px-4 py-2.5 text-slate-600 text-xs whitespace-nowrap">{p.namaMesin}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        p.status === "On progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

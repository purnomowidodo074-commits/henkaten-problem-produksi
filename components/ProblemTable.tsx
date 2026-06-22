"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";

interface Problem {
  id: number;
  date: string;
  line: string;
  jenisProblem: string;
  problem: string;
  namaMesin: string;
  penemuProblem: string;
  status: string;
}

interface Props {
  problems: Problem[];
}

export default function ProblemTable({ problems }: Props) {
  const [filterMonth, setFilterMonth] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const currentMonth = format(new Date(), "yyyy-MM");

  const filtered = useMemo(() => {
    if (!filterMonth) return problems;
    return problems.filter((p) => {
      const d = new Date(p.date);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return m === filterMonth;
    });
  }, [problems, filterMonth]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-700">List Problem Produksi</h2>
          <span className="text-xs text-slate-400">{filtered.length} data</span>
          {filterMonth && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700">
              {filterMonth}
              <button
                onClick={() => setFilterMonth("")}
                className="ml-0.5 hover:text-blue-900 leading-none"
                aria-label="Hapus filter bulan"
              >
                ×
              </button>
            </span>
          )}
        </div>

        {/* Filter toggle + month input */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showFilter && (
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              max={currentMonth}
              className="px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          )}
          <button
            onClick={() => setShowFilter((v) => !v)}
            title="Filter per bulan"
            className={`p-1.5 rounded transition-colors ${
              showFilter || filterMonth
                ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-400">
          {filterMonth ? "Tidak ada data pada bulan ini" : "Belum ada data problem"}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Tanggal", "Line", "Jenis", "Problem", "Nama Mesin", "Penemu Problem", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className={p.status === "On progress" ? "bg-yellow-50" : "bg-white"}
                >
                  <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap text-xs text-center">
                    {format(new Date(p.date), "dd/MM/yyyy")}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap text-xs font-medium text-center">{p.line}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      {p.jenisProblem}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700 text-xs text-left">{p.problem}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs whitespace-nowrap text-center">{p.namaMesin}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs whitespace-nowrap text-center">{p.penemuProblem || "-"}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-center">
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
  );
}

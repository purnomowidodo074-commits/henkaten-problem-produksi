"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  month: string;
  onProgress: number;
  finish: number;
  total: number;
}

export default function MonthlyChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Belum ada data untuk ditampilkan
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e2e8f0" }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          content={() => (
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
              {[
                { color: "#ef4444", label: "Total Temuan" },
                { color: "#f59e0b", label: "On Progress" },
                { color: "#22c55e", label: "Finish" },
              ].map(({ color, label }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#4b5563" }}>
                  <span style={{ display: "inline-block", width: 12, height: 12, background: color, borderRadius: 2 }} />
                  {label}
                </span>
              ))}
            </div>
          )}
        />
        <Bar dataKey="total" name="Total Temuan" fill="#ef4444" radius={[3, 3, 0, 0]} />
        <Bar dataKey="onProgress" name="On Progress" fill="#f59e0b" radius={[3, 3, 0, 0]} />
        <Bar dataKey="finish" name="Finish" fill="#22c55e" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

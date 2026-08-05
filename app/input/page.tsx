"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useOptions } from "@/lib/useOptions";

const JENIS_OPTIONS = ["AV", "PE", "RQ"];

export default function InputPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { lines, pics } = useOptions();

  const [form, setForm] = useState({
    date: today,
    line: "",
    jenisProblem: "",
    problem: "",
    namaMesin: "",
    penemuProblem: "",
    picPerbaikan: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.line || !form.jenisProblem || !form.problem.trim() || !form.namaMesin.trim() || !form.penemuProblem.trim()) {
      setError("Semua field wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gagal menyimpan data");
      setSuccess(true);
      setForm({ date: today, line: "", jenisProblem: "", problem: "", namaMesin: "", penemuProblem: "", picPerbaikan: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Input Problem Baru</h1>
        <p className="text-sm text-slate-500 mt-0.5">Catat temuan masalah produksi secara cepat</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Formulir Pencatatan Masalah</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          {/* Line */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Line <span className="text-red-500">*</span>
            </label>
            <select
              name="line"
              value={form.line}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
            >
              <option value="">-- Pilih Line --</option>
              {lines.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Jenis Problem */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Problem <span className="text-red-500">*</span>
            </label>
            <select
              name="jenisProblem"
              value={form.jenisProblem}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
            >
              <option value="">-- Pilih Jenis --</option>
              {JENIS_OPTIONS.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          {/* Problem */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Problem <span className="text-red-500">*</span>
            </label>
            <textarea
              name="problem"
              value={form.problem}
              onChange={handleChange}
              rows={3}
              placeholder="Deskripsikan masalah yang ditemukan..."
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Nama Mesin */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Mesin <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="namaMesin"
              value={form.namaMesin}
              onChange={handleChange}
              placeholder="Nama mesin yang bermasalah"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          {/* Penemu Problem */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Penemu Problem <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="penemuProblem"
              value={form.penemuProblem}
              onChange={handleChange}
              placeholder="Nama orang yang menemukan problem"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          {/* PIC Perbaikan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              PIC Perbaikan
            </label>
            <select
              name="picPerbaikan"
              value={form.picPerbaikan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
            >
              <option value="">-- Pilih PIC --</option>
              {pics.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700 font-medium">
              Data berhasil disimpan.
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white text-sm font-semibold py-2.5 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Menyimpan..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

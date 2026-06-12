"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import AuthModal from "@/components/AuthModal";
import { downloadPdf } from "@/lib/downloadPdf";

const LINE_OPTIONS = ["Mel-Pour-Analys", "Mould-RCS", "Core Making", "Finishing", "Maintenance", "Die Press"];
const JENIS_OPTIONS = ["AV", "PE", "RQ"];
const STATUS_OPTIONS = ["On progress", "Finish"];

interface Problem {
  id: number;
  date: string;
  line: string;
  jenisProblem: string;
  problem: string;
  namaMesin: string;
  planningPerbaikan: string;
  rencanaPerbaikan: string;
  status: string;
  keterangan: string;
  picPerbaikan: string;
}

interface ModalState {
  open: boolean;
  type: "status" | "keterangan" | "rencana";
  problemId: number | null;
  currentValue: string;
}

const MODAL_CLOSED: ModalState = {
  open: false,
  type: "status",
  problemId: null,
  currentValue: "",
};

function DataPageContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") ?? "";

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterLine, setFilterLine] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState(initialStatus);

  const [modal, setModal] = useState<ModalState>(MODAL_CLOSED);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterLine) params.set("line", filterLine);
    if (filterJenis) params.set("jenisProblem", filterJenis);
    if (filterMonth) params.set("month", filterMonth);
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/problems?${params.toString()}`);
    const data = await res.json();
    setProblems(data);
    setLoading(false);
  }, [filterLine, filterJenis, filterMonth, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openStatusModal(p: Problem) {
    setModal({ open: true, type: "status", problemId: p.id, currentValue: p.status });
  }

  function openKeteranganModal(p: Problem) {
    setModal({ open: true, type: "keterangan", problemId: p.id, currentValue: p.keterangan });
  }

  async function handleSave(value: string) {
    if (!modal.problemId) return;
    const body: Record<string, string> = {};
    if (modal.type === "status") {
      body.status = value;
    } else if (modal.type === "keterangan") {
      body.keterangan = value;
    } else if (modal.type === "rencana") {
      body.rencanaPerbaikan = value;
    }
    await fetch(`/api/problems/${modal.problemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setModal(MODAL_CLOSED);
    fetchData();
  }

  async function handleDateChange(p: Problem, date: string) {
    await fetch(`/api/problems/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planningPerbaikan: date }),
    });
    setProblems((prev) => prev.map((item) => item.id === p.id ? { ...item, planningPerbaikan: date } : item));
    if (date) {
      setModal({ open: true, type: "rencana", problemId: p.id, currentValue: p.rencanaPerbaikan || "" });
    }
  }

  async function handlePicChange(id: number, pic: string) {
    await fetch(`/api/problems/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ picPerbaikan: pic }),
    });
    setProblems((prev) => prev.map((p) => p.id === id ? { ...p, picPerbaikan: pic } : p));
  }

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      await downloadPdf(problems);
    } finally {
      setDownloading(false);
    }
  }

  async function confirmDelete() {
    if (deleteId === null) return;
    await fetch(`/api/problems/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchData();
  }

  const currentMonth = format(new Date(), "yyyy-MM");
  const hasFilter = filterLine || filterJenis || filterMonth || filterStatus;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Management Data Problem</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola dan tindak lanjuti problem produksi</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading || problems.length === 0}
            className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {downloading ? "Membuat PDF..." : "Download PDF"}
          </button>
          <a
            href="/input"
            className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Input Baru
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Filter Data</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Line</label>
            <select
              value={filterLine}
              onChange={(e) => setFilterLine(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
            >
              <option value="">Semua Line</option>
              {LINE_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Jenis Problem</label>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
            >
              <option value="">Semua Jenis</option>
              {JENIS_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
            >
              <option value="">Semua Status</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Periode (Bulan)</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              max={currentMonth}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>
        {hasFilter && (
          <button
            onClick={() => { setFilterLine(""); setFilterJenis(""); setFilterMonth(""); setFilterStatus(""); }}
            className="mt-3 text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tabel Problem
          </p>
          <p className="text-xs text-slate-400">{problems.length} data</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-400">
            Memuat data...
          </div>
        ) : problems.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-400">
            Tidak ada data yang sesuai filter
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Tanggal", "Line", "Jenis Problem", "Problem",
                    "Nama Mesin", "PIC Perbaikan", "Tanggal Perbaikan", "Rencana Perbaikan", "Status", "Keterangan"
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="px-2 py-2.5 border-b border-slate-200 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {problems.map((p) => (
                  <tr
                    key={p.id}
                    className={p.status === "On progress" ? "bg-yellow-50 hover:bg-yellow-100" : "bg-white hover:bg-slate-50"}
                  >
                    <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                      {format(new Date(p.date), "dd/MM/yyyy")}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-700 whitespace-nowrap">{p.line}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {p.jenisProblem}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-700 max-w-[200px]">
                      <div className="line-clamp-2">{p.problem}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{p.namaMesin}</td>

                    {/* PIC Perbaikan — inline dropdown, no password */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <select
                        value={p.picPerbaikan ?? ""}
                        onChange={(e) => handlePicChange(p.id, e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer hover:border-slate-400 transition-colors"
                      >
                        <option value="">— Pilih —</option>
                        {["Maintenance", "Engser", "Kaizen", "Produksi"].map((pic) => (
                          <option key={pic} value={pic}>{pic}</option>
                        ))}
                      </select>
                    </td>

                    {/* Tanggal Perbaikan — inline date input */}
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="relative flex items-center">
                        <input
                          type="date"
                          value={p.planningPerbaikan || ""}
                          onChange={(e) => handleDateChange(p, e.target.value)}
                          className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer hover:border-slate-400 transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </td>

                    {/* Rencana Perbaikan */}
                    <td className={`px-4 py-2.5 text-xs text-slate-600 max-w-[160px] ${!p.rencanaPerbaikan ? "text-center" : ""}`}>
                      <div className="line-clamp-2">{p.rencanaPerbaikan || "-"}</div>
                    </td>

                    {/* Status — clickable */}
                    <td
                      className="px-4 py-2.5 whitespace-nowrap cursor-pointer"
                      onClick={() => openStatusModal(p)}
                      title="Klik untuk mengubah status"
                    >
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        p.status === "On progress"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      } transition-colors`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Keterangan — clickable */}
                    <td
                      className="px-4 py-2.5 text-xs text-slate-500 max-w-[140px] cursor-pointer group"
                      onClick={() => openKeteranganModal(p)}
                      title="Klik untuk mengubah keterangan"
                    >
                      <div className="flex items-center gap-1">
                        <span className={`line-clamp-2 ${!p.keterangan ? "text-slate-300 italic" : ""}`}>
                          {p.keterangan || "Belum diisi"}
                        </span>
                        <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                    </td>

                    {/* Hapus */}
                    <td className="px-2 py-2.5 text-center">
                      <button
                        onClick={() => setDeleteId(p.id)}
                        title="Hapus data"
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></div>
          <span>On Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-white border border-slate-200"></div>
          <span>Finish</span>
        </div>
      </div>

      {/* Modal konfirmasi hapus */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Hapus Data</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-5">
                Yakin ingin menghapus data ini secara permanen?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Ya, Hapus
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        open={modal.open}
        type={modal.type}
        currentValue={modal.currentValue}
        onClose={() => setModal(MODAL_CLOSED)}
        onSave={handleSave}
      />
    </div>
  );
}

export default function DataPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20 text-sm text-slate-400">
        Memuat data...
      </div>
    }>
      <DataPageContent />
    </Suspense>
  );
}

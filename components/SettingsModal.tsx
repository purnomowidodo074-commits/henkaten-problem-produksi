"use client";

import { useState, useCallback } from "react";

interface OptionRow {
  id: number;
  value: string;
}

interface SettingsModalProps {
  onClose: () => void;
  onSaved: () => void;
}

interface Notice {
  text: string;
  kind: "success" | "error";
}

export default function SettingsModal({ onClose, onSaved }: SettingsModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");

  const [lines, setLines] = useState<OptionRow[]>([]);
  const [pics, setPics] = useState<OptionRow[]>([]);
  const [newLine, setNewLine] = useState("");
  const [newPic, setNewPic] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const fetchOptions = useCallback(async () => {
    const res = await fetch("/api/options");
    if (!res.ok) return;
    const data = await res.json();
    setLines(data.lines ?? []);
    setPics(data.pics ?? []);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setError("");
    try {
      const res = await fetch("/api/options/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Username atau password salah");
      } else {
        setAuthed(true);
        fetchOptions();
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleAdd(type: "line" | "pic") {
    const value = type === "line" ? newLine : newPic;
    if (!value.trim()) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, type, value: value.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotice({ text: data.error || "Gagal menyimpan", kind: "error" });
      } else {
        setNotice({ text: "Berhasil ditambahkan", kind: "success" });
        if (type === "line") setNewLine("");
        else setNewPic("");
        fetchOptions();
        onSaved();
      }
    } catch {
      setNotice({ text: "Terjadi kesalahan", kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/options", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotice({ text: data.error || "Gagal menghapus", kind: "error" });
      } else {
        setNotice({ text: "Berhasil dihapus", kind: "success" });
        fetchOptions();
        onSaved();
      }
    } catch {
      setNotice({ text: "Terjadi kesalahan", kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 bg-red-600 border-b border-red-700 rounded-t-lg">
          <h2 className="text-base font-semibold text-white">Pengaturan</h2>
          <button onClick={onClose} className="text-red-100 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {!authed ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-sm text-slate-600">
                Masukkan username dan password untuk mengelola line dan PIC perbaikan.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputCls}
                  placeholder="Masukkan username..."
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Masukkan password..."
                />
                {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {authLoading ? "Memverifikasi..." : "Masuk"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-slate-300 text-slate-600 text-sm font-medium py-2 rounded hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <>
              {notice && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 border rounded text-xs font-medium ${
                    notice.kind === "success"
                      ? "bg-white border-red-600 text-red-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {notice.kind === "success" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    )}
                  </svg>
                  {notice.text}
                </div>
              )}

              {/* Line */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Line</p>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {lines.length === 0 && <span className="text-xs text-slate-400">Belum ada line.</span>}
                  {lines.map((l) => (
                    <span
                      key={l.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-200 bg-slate-50 text-xs text-slate-700"
                    >
                      {l.value}
                      <button
                        onClick={() => handleDelete(l.id)}
                        disabled={busy}
                        title="Hapus line"
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLine}
                    onChange={(e) => setNewLine(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd("line")}
                    className={inputCls}
                    placeholder="Tambah line baru..."
                  />
                  <button
                    onClick={() => handleAdd("line")}
                    disabled={busy || !newLine.trim()}
                    className="flex-shrink-0 bg-red-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* PIC Perbaikan */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">PIC Perbaikan</p>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {pics.length === 0 && <span className="text-xs text-slate-400">Belum ada PIC.</span>}
                  {pics.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-200 bg-slate-50 text-xs text-slate-700"
                    >
                      {p.value}
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={busy}
                        title="Hapus PIC"
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPic}
                    onChange={(e) => setNewPic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd("pic")}
                    className={inputCls}
                    placeholder="Tambah PIC baru..."
                  />
                  <button
                    onClick={() => handleAdd("pic")}
                    disabled={busy || !newPic.trim()}
                    className="flex-shrink-0 bg-red-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={onClose}
                  className="w-full border border-slate-300 text-slate-600 text-sm font-medium py-2 rounded hover:bg-slate-50 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

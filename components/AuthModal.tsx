"use client";

import { useState, useEffect } from "react";

type ModalType = "status" | "planning";

interface AuthModalProps {
  open: boolean;
  type: ModalType;
  currentValue: string;
  currentKeterangan?: string;
  onClose: () => void;
  onSave: (value: string, extra?: string) => void;
}

export default function AuthModal({ open, type, currentValue, currentKeterangan, onClose, onSave }: AuthModalProps) {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [value, setValue] = useState(currentValue);
  const [keterangan, setKeterangan] = useState(currentKeterangan ?? "");

  useEffect(() => {
    if (open) {
      setPassword("");
      setAuthorized(false);
      setError("");
      setValue(currentValue);
      setKeterangan(currentKeterangan ?? "");
    }
  }, [open, currentValue, currentKeterangan]);

  const correctPassword = type === "status" ? "leader123" : "maint123";

  function handleAuth() {
    if (password === correctPassword) {
      setAuthorized(true);
      setError("");
    } else {
      setError("Kata sandi tidak valid");
    }
  }

  function handleSave() {
    onSave(value, type === "planning" ? keterangan : undefined);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-800">
            {type === "status" ? "Ubah Status" : "Tindak Lanjut"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {!authorized ? (
            <>
              <p className="text-sm text-slate-600">
                Masukkan kata sandi{" "}
                <span className="font-medium text-slate-800">
                  {type === "status" ? "Leader" : "Maintenance"}
                </span>{" "}
                untuk melanjutkan.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Kata Sandi</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Masukkan kata sandi..."
                  autoFocus
                />
                {error && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAuth}
                  className="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Verifikasi
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 border border-slate-300 text-slate-600 text-sm font-medium py-2 rounded hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </>
          ) : type === "status" ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="On progress">On Progress</option>
                  <option value="Finish">Finish</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-amber-500 text-white text-sm font-medium py-2 rounded hover:bg-amber-600 transition-colors"
                >
                  Simpan
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 border border-slate-300 text-slate-600 text-sm font-medium py-2 rounded hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Planning Perbaikan</label>
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                  placeholder="Isi rencana perbaikan..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Keterangan</label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                  placeholder="Keterangan tambahan..."
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-amber-500 text-white text-sm font-medium py-2 rounded hover:bg-amber-600 transition-colors"
                >
                  Simpan
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 border border-slate-300 text-slate-600 text-sm font-medium py-2 rounded hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

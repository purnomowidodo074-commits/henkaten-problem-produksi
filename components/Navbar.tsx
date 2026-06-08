"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/input", label: "Input Problem" },
  { href: "/data", label: "Manajemen Data" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="shadow-sm">
      {/* Garis merah atas: 12px */}
      <div className="h-3 bg-red-600 w-full" />

      {/* Putih tengah: 60px — berisi logo + nav */}
      <div className="h-[60px] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="relative flex items-center h-full">

            {/* Kiri: Logo */}
            <div className="flex-shrink-0 flex items-center gap-2.5">
              {!logoError ? (
                // Tampil logo dari public/logo.png — jika gagal muat, tampilkan placeholder
                <img
                  src="/logo.jpg"
                  alt="Logo"
                  className="h-10 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-10 h-10 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 flex-shrink-0">
                  <span className="text-[8px] text-gray-400 font-medium">LOGO</span>
                </div>
              )}
              <div>
                <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider leading-none">Sistem Informasi</p>
                <p className="text-xs font-bold text-gray-900 leading-tight mt-0.5">Henkaten &amp; Problem Produksi</p>
              </div>
            </div>

            {/* Tengah: Nav links (absolute center) */}
            <nav className="absolute left-1/2 -translate-x-1/2 flex gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                    pathname === link.href
                      ? "bg-red-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

          </div>
        </div>
      </div>

      {/* Garis merah bawah: 12px */}
      <div className="h-3 bg-red-600 w-full" />
    </header>
  );
}

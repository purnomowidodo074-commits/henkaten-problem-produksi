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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="shadow-sm">
      {/* Garis merah atas */}
      <div className="h-3 bg-red-600 w-full" />

      {/* Bar putih tengah */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center h-[60px]">

            {/* Kiri: Logo */}
            <div className="flex-shrink-0 flex items-center gap-2.5">
              {!logoError ? (
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-[18px] w-auto object-contain"
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

            {/* Desktop: Nav links (absolute center) — hanya tampil di md ke atas */}
            <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-0.5">
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

            {/* Mobile: Hamburger button — hanya tampil di bawah md */}
            <button
              className="md:hidden ml-auto p-2 rounded text-gray-600 hover:bg-gray-100 focus:outline-none"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-3 pt-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-red-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Garis merah bawah */}
      <div className="h-3 bg-red-600 w-full" />
    </header>
  );
}

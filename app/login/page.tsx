'use client';

import React, { useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

// ============================================================
// KONSTANTA
// ============================================================
// ✅ FIX: Brute force protection
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 30_000; // 30 detik cooldown setelah 5x gagal

// ✅ FIX: Pesan error generik — tidak expose info sensitif
const GENERIC_ERROR = 'Email atau password salah. Silakan coba lagi.';
const COOLDOWN_ERROR = (secs: number) =>
  `Terlalu banyak percobaan. Coba lagi dalam ${secs} detik.`;

// ============================================================
// PLACEHOLDER LOGO
// ============================================================
const PLACEHOLDER_LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' rx='64' fill='%23f3e8d0'/%3E%3Ctext x='64' y='80' text-anchor='middle' font-size='48' font-family='Arial'>📚%3C/text%3E%3C/svg%3E";

// ============================================================
// KOMPONEN
// ============================================================
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [logoSrc, setLogoSrc] = useState('/logo-akinara.png');

  // ✅ FIX: Brute force protection state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

  const router = useRouter();

  const getRemainingCooldown = (): number => {
    if (!cooldownUntil) return 0;
    return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
  };

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // ✅ FIX: Cek cooldown sebelum proses
      const remaining = getRemainingCooldown();
      if (remaining > 0) {
        setErrorMsg(COOLDOWN_ERROR(remaining));
        return;
      }

      setLoading(true);
      setErrorMsg('');

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Login berhasil — reset attempts
        setFailedAttempts(0);
        setCooldownUntil(null);
        router.push('/admin');

      } catch (err: unknown) {
        // ✅ FIX: Type-safe error handling
        // ✅ FIX: Pesan generik, tidak expose detail Supabase
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          const until = Date.now() + COOLDOWN_MS;
          setCooldownUntil(until);
          setErrorMsg(COOLDOWN_ERROR(COOLDOWN_MS / 1000));
          setFailedAttempts(0); // Reset setelah cooldown dimulai

          // Auto clear error setelah cooldown habis
          setTimeout(() => {
            setCooldownUntil(null);
            setErrorMsg('');
          }, COOLDOWN_MS);
        } else {
          const attemptsLeft = MAX_ATTEMPTS - newAttempts;
          setErrorMsg(
            `${GENERIC_ERROR} (${attemptsLeft} percobaan tersisa)`
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [email, password, failedAttempts, cooldownUntil, router]
  );

  const isOnCooldown = getRemainingCooldown() > 0;

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-orange-100 w-full max-w-md text-center">

        {/* Logo */}
        <div className="mb-6">
          <img
            src={logoSrc}
            alt="Logo Akinara Books"
            className="w-32 h-auto mx-auto object-contain drop-shadow-sm"
            // ✅ FIX: Error handling kalau logo tidak ada
            onError={() => setLogoSrc(PLACEHOLDER_LOGO)}
          />
        </div>

        {/* Judul */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[#8B5E3C] tracking-tighter">
            Admin Dashboard
          </h1>
          <p className="text-xs text-orange-300 mt-1 font-medium">
            Akinara Books & Library
          </p>
        </div>

        {/* ✅ FIX: Error alert dengan role="alert" untuk aksesibilitas */}
        {errorMsg && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2 justify-center"
          >
            <Lock className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Cooldown indicator */}
        {isOnCooldown && (
          <div className="mb-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
            <p className="text-xs text-orange-500 font-bold">
              ⏳ Akses dikunci sementara. Tunggu {getRemainingCooldown()} detik.
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6 text-left">

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-[10px] font-black text-[#8B5E3C] uppercase ml-1 tracking-widest"
            >
              Email Admin
            </label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-200" />
              <input
                id="email"
                required
                type="email"
                placeholder="admin@akinara.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // ✅ FIX: autocomplete untuk browser password manager
                autoComplete="email"
                disabled={isOnCooldown || loading}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#FF9E9E] focus:bg-white outline-none font-bold text-[#6D4C41] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-[10px] font-black text-[#8B5E3C] uppercase ml-1 tracking-widest"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-200" />
              <input
                id="password"
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // ✅ FIX: autocomplete untuk browser password manager
                autoComplete="current-password"
                disabled={isOnCooldown || loading}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#FF9E9E] focus:bg-white outline-none font-bold text-[#6D4C41] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || isOnCooldown}
            className="w-full bg-[#8B5E3C] hover:bg-[#6D4C41] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-gray-200 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isOnCooldown ? (
              <>⏳ TUNGGU {getRemainingCooldown()}s</>
            ) : (
              <>
                MASUK DASHBOARD
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>

        </form>

        {/* Link kembali */}
        <div className="mt-10">
          <Link
            href="/katalog"
            className="text-[10px] font-bold text-orange-300 hover:text-[#8B5E3C] uppercase tracking-widest transition-colors"
          >
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}
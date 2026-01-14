'use client';

import React, { useState } from 'react';
import { supabase } from '../../supabaseClient'; 
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link'; // <--- Baris ini yang tadi ketinggalan

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Jika sukses, lempar ke dashboard admin
      router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login. Periksa email & password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl border border-orange-100 w-full max-w-md animate-fade-in">
        
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <BookOpen className="text-[#FF9E9E] w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-[#8B5E3C] tracking-tighter">
            AKINARA<span className="text-[#FF9E9E]">ADMIN</span>
          </h1>
          <p className="text-[10px] font-bold text-orange-300 uppercase tracking-[0.2em] mt-2">
            Pintu Masuk Terbatas
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#8B5E3C] uppercase ml-1 tracking-widest">Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-200" />
              <input 
                required 
                type="email" 
                placeholder="admin@akinara.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#FF9E9E] focus:bg-white outline-none font-bold text-[#6D4C41] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#8B5E3C] uppercase ml-1 tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-200" />
              <input 
                required 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#FF9E9E] focus:bg-white outline-none font-bold text-[#6D4C41] transition-all"
              />
            </div>
          </div>

          <button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-[#8B5E3C] hover:bg-[#6D4C41] text-white py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-gray-200"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>MASUK DASHBOARD <ArrowRight className="w-6 h-6" /></>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          {/* Komponen Link ini yang tadi menyebabkan error */}
          <Link href="/katalog" className="text-[10px] font-bold text-orange-300 hover:text-[#8B5E3C] uppercase tracking-widest transition-colors">
            ← Kembali ke Katalog Publik
          </Link>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Truck, Calendar, Clock, Bookmark, BookOpen } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import Link from 'next/link';

// ✅ FIX: Typed interface, tidak pakai any
interface BannerData {
  id: number;
  publisher_name: string;
  target_date: string;
  eta_text: string;
  waitlist_link?: string;
  is_active: boolean;
}

export default function POInfoBanner() {
  const [bannerList, setBannerList] = useState<BannerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data banner aktif
  useEffect(() => {
    const fetchActiveBanners = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('banner_config')
          .select('*')
          .eq('is_active', true)
          .order('target_date', { ascending: true }); // Urutkan berdasarkan tanggal tutup terdekat

        if (error) {
          console.warn('Peringatan dari Supabase:', error.message);
        } else {
          setBannerList(data || []);
        }
      } catch (err) {
        console.warn('Gagal menarik data banner:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveBanners();
  }, []);

  if (isLoading || bannerList.length === 0) return null;

  return (
    <div className="bg-[#FFF9F0] py-4 border-b border-orange-100 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-40%] left-[-8%] w-64 h-64 rounded-full blur-3xl animate-pulse bg-orange-200/20" />
        <div className="absolute bottom-[-40%] right-[-8%] w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10 flex flex-col gap-4">
        {bannerList.map((bannerData) => (
          <BannerItem key={bannerData.id} bannerData={bannerData} />
        ))}
      </div>
    </div>
  );
}

function BannerItem({ bannerData }: { bannerData: BannerData }) {
  const [daysLeft, setDaysLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!bannerData?.target_date) return;

    const targetDate = new Date(bannerData.target_date).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference < 0) {
        setIsExpired(true);
        setDaysLeft(0);
      } else {
        setIsExpired(false);
        setDaysLeft(Math.ceil(difference / (1000 * 60 * 60 * 24)));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [bannerData]);

  const formattedDate = new Date(bannerData.target_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // URL ke katalog yang sudah terfilter publisher
  const katalogUrl = `/katalog?publisher=${encodeURIComponent(bannerData.publisher_name)}`;

  return (
    <div
      className={`group backdrop-blur-sm rounded-2xl px-6 py-4 md:px-8 md:py-5 shadow-md border transition-all duration-500 ease-out hover:-translate-y-0.5 flex flex-col md:flex-row items-center gap-4 md:gap-6 relative overflow-hidden ${
        isExpired
          ? 'bg-white/60 border-slate-200'
          : 'bg-white/80 border-orange-100 hover:shadow-[0_12px_24px_-8px_rgba(255,158,158,0.25)] hover:border-orange-300'
      }`}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none rounded-2xl" />

      {/* Left: Main info */}
      <div className="relative z-10 flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2">
        {/* Status badge row */}
        <div className="flex flex-wrap items-center gap-2">
          {isExpired ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider border border-blue-200 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              Batch Closed
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-wider border border-green-200 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Open PO
            </span>
          )}

          {!isExpired && daysLeft > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black uppercase tracking-wider border border-red-200 shadow-sm">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> {daysLeft} Hari Lagi
            </span>
          )}
        </div>

        {/* Publisher name — large & prominent */}
        <h3 className="text-2xl md:text-3xl font-black text-[#8B5E3C] leading-tight">
          <span
            className={`text-transparent bg-clip-text bg-gradient-to-r ${
              isExpired
                ? 'from-[#8B5E3C] to-[#6D4C41]'
                : 'from-[#FF9E9E] to-[#FF7043]'
            }`}
          >
            {bannerData.publisher_name}
          </span>
        </h3>

        {/* Info chips inline */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#6D4C41] font-bold">
          {!isExpired && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>
                Tutup <strong className="text-[#8B5E3C]">{formattedDate}</strong>
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Truck className={`w-4 h-4 ${isExpired ? 'text-blue-400' : 'text-orange-400'}`} />
            <span>
              ETA <strong className="text-[#8B5E3C]">{bannerData.eta_text}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Right: CTA Button */}
      <div className="relative z-10 flex flex-col gap-2 flex-shrink-0">
        {!isExpired && (
          <Link
            href={katalogUrl}
            className="px-6 py-3 bg-gradient-to-r from-[#8B5E3C] to-[#a0724f] text-white rounded-full font-bold text-sm tracking-wide hover:from-[#6D4C41] hover:to-[#8B5E3C] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" /> Cek Katalog PO
          </Link>
        )}

        {isExpired && bannerData.waitlist_link && (
          <a
            href={bannerData.waitlist_link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-slate-600 text-white rounded-full font-bold text-sm tracking-wide hover:bg-slate-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Bookmark className="w-4 h-4" /> Gabung Waitlist
          </a>
        )}
      </div>
    </div>
  );
}
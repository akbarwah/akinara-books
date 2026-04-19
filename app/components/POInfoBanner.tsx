'use client';

import { useState, useEffect } from 'react';
import { Truck, Calendar, Clock, Bookmark } from 'lucide-react';
import { supabase } from '@/supabaseClient';

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
  const [daysLeft, setDaysLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data banner aktif
  useEffect(() => {
    const fetchActiveBanner = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('banner_config')
          .select('*')
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.warn('Peringatan dari Supabase:', error.message);
        } else {
          setBannerData(data);
        }
      } catch (err) {
        console.warn('Gagal menarik data banner:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveBanner();
  }, []);

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

  if (isLoading || !bannerData) return null;

  const formattedDate = new Date(bannerData.target_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="bg-[#FFF9F0] py-8 border-b border-orange-100 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-[-50%] left-[-10%] w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isExpired ? 'bg-orange-100/30' : 'bg-orange-200/20'
          }`}
        />
        <div className="absolute bottom-[-50%] right-[-10%] w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div
          className={`group backdrop-blur-sm rounded-[2rem] p-6 md:p-8 shadow-lg border transition-all duration-500 ease-out hover:-translate-y-1 flex flex-col items-center text-center gap-6 relative overflow-hidden ${
            isExpired
              ? 'bg-white/60 border-slate-200'
              : 'bg-white/80 border-orange-100 hover:shadow-[0_20px_40px_-15px_rgba(255,158,158,0.3)] hover:border-orange-300'
          }`}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none rounded-[2rem]" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Status badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4 mt-2">
              {isExpired ? (
                <span className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest border border-blue-200 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                  </span>
                  Order Submitted
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-widest border border-green-200 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Ongoing PO
                </span>
              )}

              {!isExpired && daysLeft > 0 && (
                <span className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-black uppercase tracking-widest border border-red-200 shadow-sm">
                  <Clock className="w-4 h-4 animate-pulse" /> {daysLeft} Hari Lagi
                </span>
              )}
            </div>

            {/* Publisher name */}
            <h3 className="text-3xl md:text-4xl font-black text-[#8B5E3C] leading-tight tracking-wide mb-4">
              {isExpired ? 'Batch Closed: ' : 'Open PO: '}
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

            {/* Info chips */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-[#6D4C41] font-bold opacity-90 mx-auto max-w-2xl">
              {!isExpired && (
                <div className="flex items-center gap-2 bg-orange-50/80 px-4 py-2 rounded-xl border border-orange-100/50 shadow-sm">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <span>
                    Close Date: <strong className="text-[#8B5E3C] text-base">{formattedDate}</strong>
                  </span>
                </div>
              )}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm ${
                  isExpired
                    ? 'bg-blue-50/80 border-blue-100/50'
                    : 'bg-orange-50/80 border-orange-100/50'
                }`}
              >
                <Truck className={`w-5 h-5 ${isExpired ? 'text-blue-400' : 'text-orange-400'}`} />
                <span>
                  ETA Indo: <strong className="text-[#8B5E3C] text-base">{bannerData.eta_text}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-6 w-full">
            {/* Waitlist CTA */}
            {isExpired && bannerData.waitlist_link && (
              <a
                href={bannerData.waitlist_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-slate-600 text-white rounded-full font-black text-sm tracking-wider hover:bg-slate-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Bookmark className="w-5 h-5" /> GABUNG WAITLIST
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
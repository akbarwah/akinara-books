import Link from 'next/link';
import { Package } from 'lucide-react';
import Reveal from './Reveal';

export default function TrackOrderCTA() {
  return (
    <section className="bg-[#FFF9F0] pb-12 pt-4 relative z-10">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Reveal>
          <div className="relative inline-block mt-4">
            <Link 
              href="/cek-pesanan" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF9E9E] text-white rounded-full font-black tracking-wider shadow-lg hover:bg-[#ff8585] hover:-translate-y-1 transition-all shadow-[#FF9E9E]/40 border-2 border-white"
            >
              <Package className="w-5 h-5" /> CEK PESANAN ANDA
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

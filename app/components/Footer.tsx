import { Instagram, ShoppingBag, MapPin } from 'lucide-react';
import Reveal from './Reveal';

export default function Footer() {
  return (
    <footer className="bg-[#8B5E3C] text-[#FFF9F0] pt-16 pb-8 rounded-t-[3rem] -mt-8 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <Reveal>
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-[#FFF9F0] text-[#8B5E3C] px-2 py-0.5 rounded text-lg">
                  A
                </span>
                Akinara Books
              </h3>
              <p className="text-orange-100/80 leading-relaxed mb-6">
                Toko buku anak pilihan yang menghadirkan cerita-cerita penuh makna
                untuk menemani tumbuh kembang si kecil.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/akinarabooks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Akinara Books"
                  className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hover:scale-110"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://shopee.co.id/akinarabooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Shopee Akinara Books"
                  className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hover:scale-110"
                >
                  <ShoppingBag className="w-5 h-5" />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="md:text-right">
              <h4 className="font-bold text-lg mb-4 text-orange-200">Lokasi Kami</h4>
              <div className="flex flex-col md:items-end gap-3 text-orange-100/90">
                <div className="flex items-start gap-3 md:flex-row-reverse">
                  <MapPin className="w-5 h-5 text-orange-300 mt-1 shrink-0" />
                  <span>Maguwoharjo, Yogyakarta</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-orange-200/60 text-sm">
          <p>© {new Date().getFullYear()} Akinara Books & Library</p>
        </div>
      </div>
    </footer>
  );
}
'use client';

import { useState } from 'react';
import { ShoppingCart, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const NAV_LINKS = [
  { href: '#katalog', label: 'Katalog' },
  { href: '#faq', label: 'FAQ' },
  { href: '#tentang', label: 'Tentang Kami' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { getCartCount, setIsCartOpen } = useCart();
  const cartCount = getCartCount();

  // ✅ FIX: Logo error handling
  const [logoSrc, setLogoSrc] = useState('/logo-akinara.png');

  return (
    <nav
      className="fixed top-0 w-full z-50 bg-[#FFF9F0]/90 backdrop-blur-md border-b border-orange-100 transition-all duration-300"
      aria-label="Navigasi utama"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative bg-white rounded-full overflow-hidden border-2 border-orange-200 shadow-sm hover:scale-105 transition-transform duration-300">
              <img
                src={logoSrc}
                alt="Logo Akinara Books"
                className="object-cover w-full h-full"
                onError={() => setLogoSrc('/favicon.ico')}
              />
            </div>
            <span className="font-bold text-2xl text-[#8B5E3C] tracking-wide">
              Akinara<span className="text-[#FF9E9E]">Books</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#8B5E3C] font-medium hover:text-[#FF9E9E] transition-colors hover:-translate-y-0.5 transform duration-200"
              >
                {link.label}
              </a>
            ))}

            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Keranjang belanja, ${cartCount} item`}
              className="relative p-2 text-[#8B5E3C] hover:text-[#FF9E9E] transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <a
              href="https://shopee.co.id/akinarabooks"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF9E9E] hover:bg-[#ff8585] text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:-translate-y-0.5 transform duration-200"
            >
              <ShoppingBag className="w-4 h-4" /> Shopee
            </a>
          </div>

          {/* Mobile Nav Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Keranjang belanja, ${cartCount} item`}
              className="relative p-2 text-[#8B5E3C]"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
              className="text-[#8B5E3C]"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#FFF9F0] border-t border-orange-100 p-4 space-y-4 shadow-lg">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              // ✅ FIX: Tutup menu saat link diklik
              onClick={() => setIsOpen(false)}
              className="block text-[#8B5E3C] font-medium"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://shopee.co.id/akinarabooks"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="block text-[#FF9E9E] font-bold"
          >
            Ke Shopee
          </a>
        </div>
      )}
    </nav>
  );
}
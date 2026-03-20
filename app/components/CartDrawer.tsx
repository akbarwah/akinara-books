'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingBag, X, ShoppingCart, AlertCircle,
  Minus, Plus, Trash2, MessageCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23f3e8d0'/%3E%3Ctext x='150' y='220' text-anchor='middle' font-family='Arial' font-size='14' fill='%238B5E3C' opacity='0.7'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    removeFromCart,
    decreaseQuantity,
    addToCart,
    getCartTotal,
    checkoutToWhatsApp,
    hasMixedItems,
  } = useCart();

  // ✅ FIX: Pisahkan "apakah render di DOM" vs "apakah sedang animasi close"
  const [isRendered, setIsRendered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      // Buka: langsung render, mulai animasi open
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered) {
      // Tutup: mulai animasi close dulu, baru hapus dari DOM
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 300); // Harus sama dengan durasi animasi CSS (0.3s)
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  // ✅ Kunci scroll body saat drawer terbuka
  useEffect(() => {
    if (isRendered) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isRendered]);

  // ✅ Keyboard ESC untuk menutup
  useEffect(() => {
    if (!isRendered) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRendered]);

  // Jika tidak dirender sama sekali, return null
  if (!isRendered) return null;

  const handleClose = () => {
    setIsCartOpen(false); // Ini trigger useEffect di atas → animasi close
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* ✅ Backdrop dengan animasi fade in/out */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${
          isClosing ? 'animate-fade-out' : 'animate-fade-in'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* ✅ Drawer panel dengan animasi slide in/out */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang Belanja"
        className={`relative w-full max-w-md bg-[#FFF9F0] h-full shadow-2xl flex flex-col ${
          isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-orange-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-[#8B5E3C] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#FF9E9E]" /> Keranjang Belanja
          </h2>
          <button
            onClick={handleClose}
            aria-label="Tutup keranjang"
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mixed order warning */}
        {hasMixedItems && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-yellow-800">Order Campuran</p>
              <p className="text-xs text-yellow-700 mt-1 leading-relaxed">
                Kamu menggabungkan buku <b>Ready</b> & <b>PO</b>. Pengiriman
                mungkin terpisah (ongkir dobel) atau menunggu PO tiba. Admin
                akan konfirmasi via WA.
              </p>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <ShoppingCart className="w-16 h-16 text-orange-200" />
              <p className="text-[#8B5E3C] font-medium">Keranjangmu masih kosong.</p>
              <button
                onClick={handleClose}
                className="text-sm underline text-[#FF9E9E]"
              >
                Cari buku dulu yuk!
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-orange-50 relative"
              >
                {/* Status badge */}
                <div
                  className={`absolute top-0 right-0 rounded-bl-xl rounded-tr-xl px-2 py-0.5 text-[8px] font-bold text-white ${
                    item.status === 'READY' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                >
                  {item.status}
                </div>

                {/* Gambar */}
                <div className="w-20 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={item.image || PLACEHOLDER_IMAGE}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between pt-2">
                  <div>
                    <h4 className="font-bold text-[#8B5E3C] line-clamp-1 text-sm">
                      {item.title}
                    </h4>
                    <p className="text-xs text-orange-400 font-bold mt-1">
                      Rp {(item.price ?? 0).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        aria-label="Kurangi jumlah"
                        className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-[#8B5E3C] hover:text-red-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold text-[#8B5E3C] w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        aria-label="Tambah jumlah"
                        className="w-6 h-6 flex items-center justify-center bg-[#8B5E3C] text-white rounded-md shadow-sm hover:bg-[#6D4C41]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Hapus item"
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — Total & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-white border-t border-orange-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500 font-medium">Total Estimasi</span>
              <span className="text-xl font-black text-[#8B5E3C]">
                Rp {getCartTotal().toLocaleString('id-ID')}
              </span>
            </div>
            <button
              onClick={checkoutToWhatsApp}
              className="w-full py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <MessageCircle className="w-5 h-5" /> Checkout via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
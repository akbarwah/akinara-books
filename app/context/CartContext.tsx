'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { Book, CartItem } from '@/app/types/book';

// Re-export agar komponen lain bisa import dari sini
export type { Book, CartItem };

// ============================================================
// KONSTANTA
// ============================================================
const CART_STORAGE_KEY = 'akinara_cart';
const WA_PHONE = '6282314336969';

// ============================================================
// TIPE CONTEXT
// ============================================================
type CartContextType = {
  cartItems: CartItem[];
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: number) => void;
  decreaseQuantity: (bookId: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  checkoutToWhatsApp: () => void;
  hasMixedItems: boolean;
};

// ============================================================
// CONTEXT
// ============================================================
const CartContext = createContext<CartContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ✅ FIX: Load dari localStorage dengan validasi ketat
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Validasi: harus berupa array
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        } else {
          // Data tidak valid, hapus
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Gagal memuat keranjang dari localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  // ✅ FIX: Save ke localStorage dengan try/catch
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.warn('Gagal menyimpan keranjang ke localStorage:', error);
    }
  }, [cartItems]);

  // ✅ FIX: hasMixedItems sebagai useMemo, bukan state terpisah
  // Tidak ada render ekstra, langsung derived dari cartItems
  const hasMixedItems = useMemo(() => {
    const hasReady = cartItems.some((item) => item.status === 'READY');
    const hasPO = cartItems.some((item) => item.status === 'PO');
    return hasReady && hasPO;
  }, [cartItems]);

  // ✅ FIX: Semua fungsi pakai useCallback
  const addToCart = useCallback((book: Book) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === book.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...book, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const decreaseQuantity = useCallback((bookId: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === bookId
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((bookId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== bookId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // ✅ FIX: useCallback + null-safe price
  const getCartTotal = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + (item.price ?? 0) * item.quantity,
      0
    );
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // ============================================================
  // SMART CHECKOUT WHATSAPP
  // ============================================================
  const checkoutToWhatsApp = useCallback(() => {
    const readyItems = cartItems.filter((i) => i.status === 'READY');
    const poItems = cartItems.filter((i) => i.status === 'PO');
    const totalAmount = cartItems.reduce(
      (total, item) => total + (item.price ?? 0) * item.quantity,
      0
    );

    let message = `Halo Admin Akinara, saya mau checkout pesanan dari Web:\n`;

    // Bagian A: Ready Stock
    if (readyItems.length > 0) {
      message += `\n------------------\n*READY STOCK (Siap Kirim)*\n`;
      let subReady = 0;
      readyItems.forEach((item, idx) => {
        const sub = (item.price ?? 0) * item.quantity;
        subReady += sub;
        const typeInfo = item.type ? ` [${item.type}]` : '';
        message += `${idx + 1}. ${item.title}${typeInfo} (${item.quantity}x) - Rp ${sub.toLocaleString('id-ID')}\n`;
      });
      message += `_Subtotal Ready: Rp ${subReady.toLocaleString('id-ID')} (Wajib Lunas)_\n`;
    }

    // Bagian B: Pre-Order
    if (poItems.length > 0) {
      message += `\n------------------\n*PRE-ORDER (Estimasi 8-12 Minggu)*\n`;
      let subPO = 0;
      poItems.forEach((item, idx) => {
        const sub = (item.price ?? 0) * item.quantity;
        subPO += sub;
        const typeInfo = item.type ? ` [${item.type}]` : '';
        message += `${idx + 1}. ${item.title}${typeInfo} (${item.quantity}x) - Rp ${sub.toLocaleString('id-ID')}\n`;
      });

      // DP 25%
      const dpAmount = subPO * 0.25;
      message += `_Subtotal PO: Rp ${subPO.toLocaleString('id-ID')}_\n`;
      message += `_*DP 25% (Buku PO): Rp ${dpAmount.toLocaleString('id-ID')}*_\n`;
    }

    message += `\n==================\n*TOTAL TRANSAKSI: Rp ${totalAmount.toLocaleString('id-ID')}*\n==================\n`;

    if (readyItems.length > 0 && poItems.length > 0) {
      message += `\n_Catatan: Saya memesan buku Ready & PO. Mohon infonya apakah pengiriman digabung atau dipisah ya._\n`;
    }

    message += `\nMohon info rekening & ongkir ke alamat saya. Terima kasih!`;

    window.open(
      `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  }, [cartItems]);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        getCartTotal,
        getCartCount,
        checkoutToWhatsApp,
        hasMixedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart harus digunakan di dalam CartProvider');
  }
  return context;
};
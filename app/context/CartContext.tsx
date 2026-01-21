'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipe Data Buku
export type Book = {
  id: number;
  title: string;
  price: number;
  image: string;
  status: string; // 'READY', 'PO', 'BACKLIST'
  weight?: number; 
};

// Tipe Item di Keranjang
export type CartItem = Book & {
  quantity: number;
};

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

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasMixedItems, setHasMixedItems] = useState(false);

  // 1. Load data dari LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('akinara_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Gagal memuat keranjang:", error);
      }
    }
  }, []);

  // 2. Simpan data & Cek Mixed Items
  useEffect(() => {
    localStorage.setItem('akinara_cart', JSON.stringify(cartItems));
    
    // Logika Cek Campuran (Ready + PO)
    const hasReady = cartItems.some(item => item.status === 'READY');
    const hasPO = cartItems.some(item => item.status === 'PO');
    
    setHasMixedItems(hasReady && hasPO);

  }, [cartItems]);

  const addToCart = (book: Book) => {
    setCartItems((prevItems) => {
      const isItemInCart = prevItems.find((item) => item.id === book.id);
      if (isItemInCart) {
        return prevItems.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...book, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const decreaseQuantity = (bookId: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === bookId
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item
      )
    );
  };

  const removeFromCart = (bookId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== bookId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // --- LOGIKA SMART CHECKOUT WA (DENGAN HITUNGAN DP) ---
  const checkoutToWhatsApp = () => {
    const phoneNumber = "6282314336969"; 
    
    const readyItems = cartItems.filter(i => i.status === 'READY');
    const poItems = cartItems.filter(i => i.status === 'PO');
    const totalAmount = getCartTotal();

    let message = `Halo Admin Akinara, saya mau checkout pesanan dari Web:\n`;

    // BAGIAN A: READY STOCK
    if (readyItems.length > 0) {
        message += `\n------------------\n*READY STOCK (Siap Kirim)*\n`;
        let subReady = 0;
        readyItems.forEach((item, idx) => {
            const sub = item.price * item.quantity;
            subReady += sub;
            message += `${idx + 1}. ${item.title} (${item.quantity}x) - Rp ${sub.toLocaleString('id-ID')}\n`;
        });
        message += `_Subtotal Ready: Rp ${subReady.toLocaleString('id-ID')} (Wajib Lunas)_\n`;
    }

    // BAGIAN B: PRE-ORDER (Updated with DP Calculation)
    if (poItems.length > 0) {
        message += `\n------------------\n*PRE-ORDER (Estimasi 8-12 Minggu)*\n`;
        let subPO = 0;
        poItems.forEach((item, idx) => {
            const sub = item.price * item.quantity;
            subPO += sub;
            message += `${idx + 1}. ${item.title} (${item.quantity}x) - Rp ${sub.toLocaleString('id-ID')}\n`;
        });
        
        // HITUNG DP 25%
        const dpAmount = subPO * 0.25;

        message += `_Subtotal PO: Rp ${subPO.toLocaleString('id-ID')}_\n`;
        message += `_*DP 25% (Buku PO): Rp ${dpAmount.toLocaleString('id-ID')}*_\n`;
    }

    message += `\n==================\n*TOTAL TRANSAKSI: Rp ${totalAmount.toLocaleString('id-ID')}*\n==================\n`;
    
    if (readyItems.length > 0 && poItems.length > 0) {
        message += `\n_Catatan: Saya memesan buku Ready & PO. Mohon infonya apakah pengiriman digabung atau dipisah ya._\n`;
    }

    message += `\nMohon info rekening & ongkir ke alamat saya. Terima kasih!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

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

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
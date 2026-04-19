'use client';

import React, { useState, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
  Truck,
  Wallet,
  FileText,
  XCircle,
  AlertTriangle,
  X,
  Heart,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== TYPES ====================

interface OrderItem {
  id: string;
  book_title: string;
  qty: number;
  format: string;
  price: number;
}

interface Order {
  id: string;
  order_number?: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  deposit_amount: number;
  outstanding_amount: number;
  order_items: OrderItem[];
}

interface Customer {
  id: string;
  full_name: string;
}

// ==================== HELPERS ====================

const formatRupiah = (num: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const normalizePhone = (raw: string): string => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('62')) {
    digits = '0' + digits.slice(2);
  }
  return digits;
};

const getOrderLabel = (id: string, orderNumber?: string): string => {
  if (orderNumber) return orderNumber;
  return `#${id.slice(0, 8).toUpperCase()}`;
};

const getOrderStatusConfig = (status: string) => {
  switch (status) {
    case 'Diproses':
      return {
        label: 'Diproses',
        color: 'bg-blue-100 text-blue-600',
        accent: 'bg-blue-400',
      };
    case 'Dikirim':
      return {
        label: 'Dikirim',
        color: 'bg-yellow-100 text-yellow-700',
        accent: 'bg-yellow-400',
      };
    case 'Delivered':
      return {
        label: 'Terkirim',
        color: 'bg-green-100 text-green-600',
        accent: 'bg-green-400',
      };
    default:
      return {
        label: status,
        color: 'bg-gray-100 text-gray-600',
        accent: 'bg-gray-400',
      };
  }
};

// ==================== DECORATIVE COMPONENTS ====================

function FloatingBooks() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-4 top-10 text-[#FF9E9E]/20"
      >
        <BookOpen className="w-24 h-24" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute -left-6 top-24 text-[#8B5E3C]/10"
      >
        <ShoppingBag className="w-20 h-20" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute right-12 top-32 text-orange-200/30"
      >
        <Sparkles className="w-10 h-10" />
      </motion.div>
    </div>
  );
}

function BackgroundDecoration() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FF9E9E]/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -left-32 w-72 h-72 bg-orange-200/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-56 h-56 bg-[#8B5E3C]/5 rounded-full blur-3xl" />
    </div>
  );
}

// ==================== SKELETON COMPONENTS ====================

function SkeletonCard() {
  return (
    <div className="mb-4 bg-white rounded-[2rem] border border-orange-100 shadow-sm overflow-hidden animate-pulse">
      <div className="flex">
        <div className="w-1.5 bg-gray-200 rounded-l-[2rem]" />
        <div className="p-5 sm:p-6 flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-40 bg-gray-200 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
          <div className="flex items-end justify-between mt-6">
            <div>
              <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-32 bg-gray-200 rounded" />
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="bg-gradient-to-br from-[#8B5E3C] to-[#a0724f] p-6 rounded-3xl shadow-xl mb-8 animate-pulse">
      <div className="h-4 w-48 bg-white/20 rounded mb-5" />
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/20 p-4 rounded-2xl h-24" />
        <div className="bg-black/20 p-4 rounded-2xl h-24" />
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function CekPesananPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Active' | 'Delivered'>('Active');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // ==================== MEMOIZED VALUES ====================

  const filteredOrders = useMemo(() => {
    return activeTab === 'Active'
      ? orders.filter((o) => o.order_status !== 'Delivered')
      : orders.filter((o) => o.order_status === 'Delivered');
  }, [orders, activeTab]);

  const totalBooks = useMemo(() => {
    return orders.reduce(
      (sum, order) =>
        sum + order.order_items.reduce((acc, item) => acc + item.qty, 0),
      0
    );
  }, [orders]);

  const totalOutstanding = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.outstanding_amount, 0);
  }, [orders]);

  const activeCount = useMemo(() => {
    return orders.filter((o) => o.order_status !== 'Delivered').length;
  }, [orders]);

  const deliveredCount = useMemo(() => {
    return orders.filter((o) => o.order_status === 'Delivered').length;
  }, [orders]);

  // ==================== HANDLERS ====================

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9+\s\-]/g, '');
    setPhoneNumber(value);
  };

  const handleClear = () => {
    setPhoneNumber('');
    setOrders([]);
    setHasSearched(false);
    setExpandedOrder(null);
    setErrorMessage(null);
    setNotFound(false);
    setCustomerName(null);
    setActiveTab('Active');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phoneNumber);

    if (!normalized || normalized.length < 8) {
      setErrorMessage('Masukkan nomor HP yang valid (minimal 8 digit).');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setOrders([]);
    setErrorMessage(null);
    setNotFound(false);
    setCustomerName(null);
    setExpandedOrder(null);

    try {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, full_name')
        .eq('phone_number', normalized)
        .single();

      if (customerError || !customerData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const customer = customerData as Customer;
      setCustomerName(customer.full_name);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        setErrorMessage('Gagal mengambil data pesanan. Silakan coba lagi.');
        setLoading(false);
        return;
      }

      if (ordersData) {
        setOrders(ordersData as Order[]);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-[#6D4C41] font-sans pb-20 relative">
      <BackgroundDecoration />

      {/* ===== HEADER ===== */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-orange-100/50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-black text-[#8B5E3C] text-xl flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="w-5 h-5 text-[#FF9E9E] group-hover:scale-110 transition-transform" />
            </motion.div>
            Akinara
          </Link>
          <span className="text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-orange-100 to-pink-50 text-orange-600 rounded-full border border-orange-200/50 shadow-sm">
            📦 Lacak Pesanan
          </span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-10 relative z-10">
        {/* ===== HERO SECTION ===== */}
        <div className="text-center mb-10 relative">
          <FloatingBooks />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-orange-100 shadow-sm mb-5 text-xs font-bold text-[#8B5E3C]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9E9E]" />
              Cek status pesanan pre-order kamu
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#8B5E3C] mb-3 leading-tight">
              Lacak Pesanan
              <br />
              <span className="bg-gradient-to-r from-[#FF9E9E] to-[#ffb8b8] bg-clip-text text-transparent">
                Kamu! 📚
              </span>
            </h1>
            <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
              Masukkan nomor WhatsApp yang terdaftar saat pre-order untuk melihat
              status pesanan.
            </p>
          </motion.div>
        </div>

        {/* ===== SEARCH FORM ===== */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mb-6"
        >
          <div
            className={`relative rounded-[2rem] transition-all duration-300 ${isFocused
              ? 'shadow-lg shadow-[#FF9E9E]/20 ring-4 ring-[#FF9E9E]/10'
              : 'shadow-sm'
              }`}
          >
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="tel"
              inputMode="numeric"
              required
              value={phoneNumber}
              onChange={handlePhoneChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Contoh: 08123456789"
              className="w-full pl-14 pr-28 py-5 rounded-[2rem] bg-white border border-orange-100 outline-none text-[#6D4C41] font-bold text-lg transition-all"
            />
            <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
              {phoneNumber && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="aspect-square h-full bg-gradient-to-br from-[#FF9E9E] to-[#ff8585] hover:from-[#ff8585] hover:to-[#ff7070] text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-[#FF9E9E]/30 disabled:opacity-60"
                aria-label="Cari pesanan"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Search className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.form>

        {/* ===== ERROR MESSAGE ===== */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              key="error-banner"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium shadow-sm"
            >
              <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="flex-1">{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="ml-auto hover:bg-red-100 p-1 rounded-lg transition-colors"
                aria-label="Tutup pesan error"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== LOADING SKELETON ===== */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <OverviewSkeleton />
              <SkeletonCard />
              <SkeletonCard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== NOMOR TIDAK DITEMUKAN ===== */}
        <AnimatePresence>
          {hasSearched && !loading && notFound && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="text-center py-12 px-6 bg-white rounded-3xl border border-orange-100 shadow-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <XCircle className="w-10 h-10 text-red-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-600 mb-2">
                  Nomor HP Tidak Terdaftar
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Nomor{' '}
                  <span className="font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                    {phoneNumber}
                  </span>{' '}
                  belum terdaftar di sistem kami. Pastikan nomor sesuai saat
                  pre-order.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== OVERVIEW + ORDERS ===== */}
        <AnimatePresence>
          {hasSearched && !loading && !notFound && orders.length > 0 && (
            <motion.div
              key="overview-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {/* Sapaan Customer */}
              {customerName && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-5 text-center"
                >
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-orange-100 shadow-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FF9E9E] to-[#ffb8b8] rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm">
                      {customerName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      Halo,{' '}
                      <span className="font-bold text-[#8B5E3C]">
                        {customerName}
                      </span>{' '}
                      👋
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Overview Analytics Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#8B5E3C] via-[#9a6b49] to-[#a0724f] p-6 rounded-3xl shadow-xl shadow-[#8B5E3C]/20 mb-8 border border-orange-200/50 relative overflow-hidden text-white"
              >
                {/* Decorative elements */}
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute left-1/2 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute right-10 bottom-4 w-16 h-16 bg-[#FF9E9E]/10 rounded-full blur-xl" />

                {/* Dot pattern overlay */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                <div className="relative">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#FF9E9E] mb-5 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Ringkasan Pesanan
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-black/25 transition-colors">
                      <div className="flex items-center gap-2 text-orange-200 mb-2 text-xs uppercase font-bold tracking-wider">
                        <BookOpen className="w-4 h-4" /> Total Dibeli
                      </div>
                      <div className="text-3xl font-black leading-none">
                        {totalBooks}
                        <span className="text-sm font-medium text-white/60 tracking-wide ml-1">
                          Buku
                        </span>
                      </div>
                    </div>

                    <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-black/25 transition-colors">
                      <div className="flex items-center gap-2 text-orange-200 mb-2 text-xs uppercase font-bold tracking-wider">
                        <Wallet className="w-4 h-4" /> Sisa Tagihan
                      </div>
                      <div
                        className={`text-xl sm:text-2xl font-black leading-none ${totalOutstanding === 0 ? 'text-green-300' : ''
                          }`}
                      >
                        {totalOutstanding === 0
                          ? '✓ Lunas'
                          : formatRupiah(totalOutstanding)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Tabs Navigation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative flex bg-white p-1.5 rounded-2xl shadow-sm border border-orange-100/80 mb-6"
              >
                {/* Sliding Indicator */}
                <motion.div
                  className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-[#FF9E9E] to-[#ff8585] shadow-lg shadow-[#FF9E9E]/25"
                  initial={false}
                  animate={{
                    left: activeTab === 'Active' ? '6px' : '50%',
                    right: activeTab === 'Active' ? '50%' : '6px',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />

                <button
                  onClick={() => setActiveTab('Active')}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors z-10 ${activeTab === 'Active' ? 'text-white' : 'text-gray-500'
                    }`}
                >
                  <Package className="w-4 h-4" /> Pesanan Aktif
                  {activeCount > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${activeTab === 'Active'
                        ? 'bg-white/30 text-white'
                        : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                      {activeCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('Delivered')}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors z-10 ${activeTab === 'Delivered' ? 'text-white' : 'text-gray-500'
                    }`}
                >
                  <Truck className="w-4 h-4" /> Terkirim
                  {deliveredCount > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${activeTab === 'Delivered'
                        ? 'bg-white/30 text-white'
                        : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                      {deliveredCount}
                    </span>
                  )}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ===== EMPTY STATE PER TAB ===== */}
          {hasSearched &&
            !loading &&
            !notFound &&
            orders.length > 0 &&
            filteredOrders.length === 0 && (
              <motion.div
                key="empty-tab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 px-6 bg-white rounded-3xl border border-orange-100 shadow-sm relative overflow-hidden"
              >
                {activeTab === 'Active' ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-transparent pointer-events-none" />
                    <div className="relative">
                      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle className="w-10 h-10 text-green-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-600 mb-1">
                        Semua pesanan sudah terkirim! 🎉
                      </h3>
                      <p className="text-sm text-gray-400">
                        Tidak ada pesanan aktif saat ini.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none" />
                    <div className="relative">
                      <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Package className="w-10 h-10 text-orange-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-600 mb-1">
                        Belum ada pesanan terkirim
                      </h3>
                      <p className="text-sm text-gray-400">
                        Pesanan Anda masih dalam proses.
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            )}

          {/* ===== CUSTOMER ADA TAPI 0 PESANAN ===== */}
          {hasSearched && !loading && !notFound && orders.length === 0 && (
            <motion.div
              key="no-orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 px-6 bg-white rounded-3xl border border-orange-100 shadow-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <ShoppingBag className="w-10 h-10 text-orange-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-600 mb-2">
                  Belum Ada Pesanan
                </h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Akun Anda terdaftar, namun belum memiliki riwayat pesanan.
                </p>
              </div>
            </motion.div>
          )}

          {/* ===== ORDER CARDS ===== */}
          {filteredOrders.map((order, index) => {
            const statusConfig = getOrderStatusConfig(order.order_status);
            const isExpanded = expandedOrder === order.id;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className="mb-4 bg-white rounded-[2rem] border border-orange-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {/* Status Accent Strip */}
                  <div
                    className={`w-1.5 ${statusConfig.accent} rounded-l-[2rem] flex-shrink-0`}
                  />

                  <div className="flex-1">
                    {/* Card Header */}
                    <div
                      className="p-5 sm:p-6 cursor-pointer hover:bg-orange-50/30 transition-colors"
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order.id)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpandedOrder(isExpanded ? null : order.id);
                        }
                      }}
                      aria-expanded={isExpanded}
                      aria-label={`Pesanan ${getOrderLabel(order.id, order.order_number)}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{' '}
                            {formatDate(order.created_at)}
                          </div>
                          <div className="font-bold text-lg text-[#8B5E3C]">
                            {getOrderLabel(order.id, order.order_number)}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {order.payment_status === 'Lunas' ? (
                            <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
                              <CheckCircle className="w-3 h-3" /> Lunas
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold border border-orange-100">
                              DP
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-6">
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase mb-1">
                            Total Pesanan
                          </div>
                          <div className="font-black text-[#6D4C41] text-lg">
                            {formatRupiah(order.total_amount)}
                          </div>
                        </div>

                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-[#8B5E3C]"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-orange-50 bg-gradient-to-b from-[#FFF9F0]/80 to-white/50">
                            <div className="p-5 sm:p-6">
                              {/* Rincian Buku */}
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5" />
                                Rincian Buku
                              </h4>
                              <div className="space-y-2.5 mb-6">
                                {order.order_items.map((item, itemIndex) => (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: itemIndex * 0.05 }}
                                    className="flex justify-between items-center text-sm bg-white p-3.5 rounded-2xl border border-orange-50 shadow-sm hover:border-orange-100 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-orange-50 text-[#8B5E3C] rounded-xl flex items-center justify-center font-black text-xs border border-orange-200/50 shadow-sm">
                                        {item.qty}x
                                      </div>
                                      <div>
                                        <p className="font-bold text-[#6D4C41]">
                                          {item.book_title}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                          {item.format}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-[#8B5E3C]">
                                        {formatRupiah(item.price * item.qty)}
                                      </p>
                                      {item.qty > 1 && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                          @{formatRupiah(item.price)}
                                        </p>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>

                              {/* Receipt Style Payment Breakdown */}
                              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 bg-orange-50/50 border-b border-orange-100">
                                  <h4 className="text-xs font-bold text-[#8B5E3C] uppercase tracking-widest flex items-center gap-2">
                                    <Wallet className="w-3.5 h-3.5" />
                                    Rincian Pembayaran
                                  </h4>
                                </div>
                                <div className="p-4 space-y-3 text-sm">
                                  <div className="flex justify-between font-medium text-gray-500">
                                    <span>Total Harga</span>
                                    <span>
                                      {formatRupiah(order.total_amount)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between font-medium text-gray-500">
                                    <span>Deposit Masuk</span>
                                    <span className="text-green-600">
                                      − {formatRupiah(order.deposit_amount)}
                                    </span>
                                  </div>

                                  {/* Dashed separator */}
                                  <div className="border-t-2 border-dashed border-orange-100" />

                                  <div className="flex justify-between font-bold text-base">
                                    <span className="text-[#8B5E3C]">
                                      Sisa Tagihan
                                    </span>
                                    <span
                                      className={
                                        order.outstanding_amount > 0
                                          ? 'text-red-500'
                                          : 'text-green-500'
                                      }
                                    >
                                      {order.outstanding_amount === 0
                                        ? '✓ Lunas'
                                        : formatRupiah(
                                          order.outstanding_amount
                                        )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </main>
    </div>
  );
}
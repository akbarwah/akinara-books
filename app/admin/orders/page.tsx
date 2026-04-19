'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../supabaseClient';
import {
  ArrowLeft,
  Plus,
  Edit,
  RefreshCcw,
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Package,
  Truck,
  Clock,
  Filter,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ==================== TYPES ====================

interface Customer {
  full_name: string;
  phone_number: string;
}

interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  deposit_amount: number;
  outstanding_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  customers: Customer;
}

type OrderStatusType = 'Diproses' | 'Dikirim' | 'Delivered';
type FilterTab = 'Semua' | 'Diproses' | 'Dikirim' | 'Delivered';

// ==================== CONSTANTS ====================

const INACTIVITY_LIMIT = 10 * 60 * 1000;

const ORDER_STATUS_OPTIONS: { value: OrderStatusType; label: string }[] = [
  { value: 'Diproses', label: 'Diproses' },
  { value: 'Dikirim', label: 'Dikirim' },
  { value: 'Delivered', label: 'Terkirim' },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Diproses':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Dikirim':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'Delivered':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'Terkirim';
    default:
      return status || 'Diproses';
  }
};

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};

// ==================== MAIN COMPONENT ====================

export default function AdminOrdersPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Semua');

  // ==================== COMPUTED VALUES ====================

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'Semua') return orders;
    return orders.filter((o) => (o.order_status || 'Diproses') === activeFilter);
  }, [orders, activeFilter]);

  const statusCounts = useMemo(() => {
    return {
      Semua: orders.length,
      Diproses: orders.filter((o) => !o.order_status || o.order_status === 'Diproses').length,
      Dikirim: orders.filter((o) => o.order_status === 'Dikirim').length,
      Delivered: orders.filter((o) => o.order_status === 'Delivered').length,
    };
  }, [orders]);

  const summaryData = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalOutstanding = orders.reduce((sum, o) => sum + o.outstanding_amount, 0);
    return { totalRevenue, totalOutstanding };
  }, [orders]);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const performLogout = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem('admin_last_active');
      router.push('/login');
    };

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      localStorage.setItem('admin_last_active', Date.now().toString());
      inactivityTimer = setTimeout(() => {
        performLogout();
      }, INACTIVITY_LIMIT);
    };

    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setIsChecking(false);
      fetchOrders();

      const events = ['mousemove', 'click', 'keypress', 'scroll'];
      events.forEach((e) => window.addEventListener(e, resetTimer));
      resetTimer();
    };

    checkUser();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      const events = ['mousemove', 'click', 'keypress', 'scroll'];
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [router]);

  // ==================== API FUNCTIONS ====================

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        customers (full_name, phone_number)
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      setNotification({ type: 'error', text: 'Gagal memuat daftar pesanan.' });
    } else {
      setOrders((data as Order[]) || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('admin_last_active');
    router.push('/login');
  };

  const handleDeleteOrder = async (orderId: string) => {
    await supabase.from('order_items').delete().eq('order_id', orderId);
    const { error } = await supabase.from('orders').delete().eq('id', orderId);

    if (error) {
      setNotification({
        type: 'error',
        text: 'Gagal menghapus pesanan: ' + error.message,
      });
    } else {
      setNotification({ type: 'success', text: 'Pesanan berhasil dihapus.' });
      fetchOrders();
    }
    setConfirmDeleteId(null);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatusType) => {
    setUpdatingStatusId(orderId);

    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', orderId);

    if (error) {
      setNotification({
        type: 'error',
        text: 'Gagal mengubah status: ' + error.message,
      });
    } else {
      // Update lokal tanpa refetch
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );
      setNotification({
        type: 'success',
        text: `Status pesanan diubah ke "${getStatusLabel(newStatus)}"`,
      });
    }

    setUpdatingStatusId(null);
  };

  // ==================== RENDER ====================

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-[#8B5E3C] mb-4" />
        <p className="text-[#8B5E3C] font-black uppercase tracking-widest text-xs">
          Mengecek Akses...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-[#6D4C41] font-sans pb-20 overflow-x-hidden text-sm">
      {/* ===== HEADER ===== */}
      <header className="bg-[#FFF9F0]/90 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-white rounded-full transition-all text-[#8B5E3C]"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-[#8B5E3C] tracking-tight">
              Order<span className="text-[#FF9E9E]">Manager</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="p-2.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full transition-all shadow-sm"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
            <Link
              href="/admin/orders/new"
              className="bg-[#FF9E9E] hover:bg-[#ff8585] text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Pesanan Baru
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 bg-white border border-orange-100 text-[#8B5E3C] hover:text-red-500 rounded-full transition-all shadow-sm"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[96%] mx-auto py-8">
        {/* ===== NOTIFICATION ===== */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${notification.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
              }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            {notification.text}
          </div>
        )}

        {/* ===== SUMMARY CARDS ===== */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Total Pesanan
              </div>
              <div className="text-2xl font-black text-[#8B5E3C]">{orders.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Diproses
              </div>
              <div className="text-2xl font-black text-blue-600">{statusCounts.Diproses}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Dikirim
              </div>
              <div className="text-2xl font-black text-yellow-600">{statusCounts.Dikirim}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Terkirim
              </div>
              <div className="text-2xl font-black text-green-600">{statusCounts.Delivered}</div>
            </div>
          </div>
        )}

        {/* ===== FILTER TABS ===== */}
        {!loading && orders.length > 0 && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {(['Semua', 'Diproses', 'Dikirim', 'Delivered'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${activeFilter === tab
                    ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-md'
                    : 'bg-white text-gray-500 border-orange-100 hover:bg-orange-50'
                  }`}
              >
                {tab === 'Delivered' ? 'Terkirim' : tab}
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === tab ? 'bg-white/20' : 'bg-gray-100'
                    }`}
                >
                  {statusCounts[tab]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ===== ORDERS TABLE ===== */}
        <div className="bg-white rounded-[2.5rem] border border-orange-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-orange-50/30 border-b border-orange-100">
                <th className="px-6 py-5 text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest text-center">
                  Order ID
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest">
                  Pelanggan
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest text-center">
                  Total
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest text-center">
                  Pembayaran
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest text-center">
                  Status Pengiriman
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-200 mx-auto mb-2" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-20 text-gray-400 font-bold"
                  >
                    {activeFilter === 'Semua'
                      ? 'Belum ada pesanan'
                      : `Tidak ada pesanan berstatus "${activeFilter === 'Delivered' ? 'Terkirim' : activeFilter}"`}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const currentStatus = order.order_status || 'Diproses';

                  return (
                    <tr key={order.id} className="hover:bg-[#FFF9F0] transition-all">
                      {/* Order ID */}
                      <td className="px-6 py-4 text-xs font-bold text-gray-400 text-center">
                        {order.id}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#6D4C41]">
                          {order.customers?.full_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.customers?.phone_number}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 text-center">
                        <div className="font-bold text-[#8B5E3C]">
                          {formatRupiah(order.total_amount)}
                        </div>
                        {order.outstanding_amount > 0 && (
                          <div className="text-xs text-red-400">
                            Sisa: {formatRupiah(order.outstanding_amount)}
                          </div>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="px-6 py-4 text-center text-xs">
                        <span
                          className={`px-3 py-1 rounded-full font-bold shadow-sm ${order.payment_status === 'Lunas'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                            }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>

                      {/* Order Status - INLINE DROPDOWN */}
                      <td className="px-6 py-4 text-center">
                        <div className="relative inline-block">
                          {updatingStatusId === order.id ? (
                            <div className="flex items-center justify-center gap-2 px-3 py-1.5">
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                              <span className="text-xs text-gray-400 font-bold">
                                Updating...
                              </span>
                            </div>
                          ) : (
                            <div className="relative">
                              <select
                                value={currentStatus}
                                onChange={(e) =>
                                  handleStatusChange(
                                    order.id,
                                    e.target.value as OrderStatusType
                                  )
                                }
                                className={`appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border transition-all focus:ring-2 focus:ring-offset-1 focus:ring-[#8B5E3C]/20 outline-none ${getStatusStyle(currentStatus)}`}
                              >
                                {ORDER_STATUS_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2 items-center">
                          {confirmDeleteId === order.id ? (
                            <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-xl border border-red-200">
                              <span className="text-xs text-red-600 font-bold px-1">
                                Yakin?
                              </span>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="text-xs bg-red-500 text-white px-2 py-1 rounded font-bold hover:bg-red-600"
                              >
                                Hapus
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-xs text-slate-500 px-1 font-bold hover:text-slate-700"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <>
                              <Link
                                href={`/admin/invoice/${order.id}`}
                                className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 text-xs font-bold"
                                title="Lihat Invoice"
                              >
                                Invoice
                              </Link>
                              <Link
                                href={`/admin/orders/edit/${order.id}`}
                                className="p-2 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100"
                                title="Edit Order"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => setConfirmDeleteId(order.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="Hapus Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
'use client';

import React, { useState, useEffect, useMemo } from 'react'; // ✅ tambah useMemo
import { supabase } from '../../../../supabaseClient';
import { generateOrderId } from '../../../utils/order';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ==================== TYPES ====================

type OrderStatusType = 'Diproses' | 'Dikirim' | 'Delivered';

interface BookOption {
  title: string;
  type: string;
  price: number;
}

interface OrderItemForm {
  book_title: string;
  format: string;
  qty: number;
  price: number;
}

const ORDER_STATUS_OPTIONS: {
  value: OrderStatusType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
    {
      value: 'Diproses',
      label: 'Diproses',
      description: 'Pesanan sedang disiapkan',
      icon: <Clock className="w-4 h-4" />,
      color: 'border-blue-200 bg-blue-50 text-blue-700',
    },
    {
      value: 'Dikirim',
      label: 'Dikirim',
      description: 'Pesanan dalam perjalanan',
      icon: <Truck className="w-4 h-4" />,
      color: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    },
    {
      value: 'Delivered',
      label: 'Terkirim',
      description: 'Pesanan sudah diterima customer',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'border-green-200 bg-green-50 text-green-700',
    },
  ];

// ==================== MAIN COMPONENT ====================

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Customer State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // Books State
  const [availableBooks, setAvailableBooks] = useState<BookOption[]>([]);

  // Order Items State
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([
    { book_title: '', format: '', qty: 1, price: 0 }, // ✅ format kosong by default
  ]);

  // Payment State
  const [depositAmount, setDepositAmount] = useState(0);
  const [orderStatus, setOrderStatus] = useState<OrderStatusType>('Diproses');

  // ==================== DERIVED DATA ====================

  // ✅ Daftar judul unik (untuk datalist, tanpa duplikat)
  const uniqueTitles = useMemo(() => {
    const titles = new Set(availableBooks.map((b) => b.title));
    return Array.from(titles).sort();
  }, [availableBooks]);

  // ✅ Helper: ambil format yang tersedia untuk judul tertentu
  const getFormatsForTitle = (title: string): BookOption[] => {
    return availableBooks.filter(
      (b) => b.title.toLowerCase() === title.toLowerCase()
    );
  };

  // ✅ Helper: cari harga berdasarkan judul + format
  const getPriceForTitleAndFormat = (title: string, format: string): number => {
    const match = availableBooks.find(
      (b) =>
        b.title.toLowerCase() === title.toLowerCase() &&
        b.type.toLowerCase() === format.toLowerCase()
    );
    return match?.price ?? 0;
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // ==================== API FUNCTIONS ====================

  const fetchBooks = async () => {
    const { data } = await supabase.from('books').select('title, type, price');
    if (data) setAvailableBooks(data);
  };

  const checkCustomer = async () => {
    if (!phoneNumber) return;
    setIsSearchingCustomer(true);
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (data) {
      setFullName(data.full_name);
      setCustomerId(data.id);
      setNotification({ type: 'success', text: 'Pelanggan ditemukan!' });
    } else {
      setFullName('');
      setCustomerId(null);
      setNotification({ type: 'success', text: 'Pelanggan baru.' });
    }
    setIsSearchingCustomer(false);
  };

  // ==================== ORDER ITEMS HANDLERS ====================

  const handleAddBook = () => {
    setOrderItems([
      ...orderItems,
      { book_title: '', format: '', qty: 1, price: 0 }, // ✅ format kosong
    ]);
  };

  const handleRemoveBook = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    (newItems[index] as any)[field] = value;

    // ✅ Saat judul dipilih → set format ke varian pertama + harga otomatis
    if (field === 'book_title') {
      const formats = getFormatsForTitle(value);
      if (formats.length > 0) {
        newItems[index].format = formats[0].type;
        newItems[index].price = formats[0].price;
      } else {
        newItems[index].format = '';
        newItems[index].price = 0;
      }
    }

    // ✅ Saat format diubah → update harga sesuai judul + format
    if (field === 'format') {
      const price = getPriceForTitleAndFormat(
        newItems[index].book_title,
        value
      );
      newItems[index].price = price;
    }

    // Consolidate duplicate items
    if (field === 'book_title' || field === 'format') {
      const currentTitle = newItems[index].book_title;
      const currentFormat = newItems[index].format;

      if (currentTitle && currentFormat) {
        const existingIndex = newItems.findIndex(
          (item, i) =>
            i !== index &&
            item.book_title === currentTitle &&
            item.format === currentFormat
        );

        if (existingIndex !== -1) {
          newItems[existingIndex].qty += newItems[index].qty || 1;
          newItems.splice(index, 1);
        }
      }
    }

    setOrderItems(newItems);
  };

  // ==================== COMPUTED VALUES ====================

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const outstandingAmount = Math.max(0, totalAmount - depositAmount);
  const paymentStatus = outstandingAmount <= 0 ? 'Lunas' : 'DP';

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // ==================== SUBMIT ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !fullName || orderItems.length === 0) {
      setNotification({
        type: 'error',
        text: 'Mohon lengkapi semua data wajib.',
      });
      return;
    }

    // ✅ Validasi: pastikan semua item punya format
    const invalidItems = orderItems.filter((item) => !item.format);
    if (invalidItems.length > 0) {
      setNotification({
        type: 'error',
        text: 'Mohon pilih format untuk semua buku.',
      });
      return;
    }

    setLoading(true);
    try {
      let finalCustomerId = customerId;

      if (!finalCustomerId) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('phone_number', phoneNumber)
          .single();

        if (existingCustomer) {
          finalCustomerId = existingCustomer.id;
        } else {
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert([{ phone_number: phoneNumber, full_name: fullName }])
            .select()
            .single();

          if (customerError) throw customerError;
          finalCustomerId = newCustomer.id;
        }
      }

      // Create Order
      const orderId = generateOrderId();
      const { error: orderError } = await supabase.from('orders').insert([
        {
          id: orderId,
          customer_id: finalCustomerId,
          total_amount: totalAmount,
          deposit_amount: depositAmount,
          outstanding_amount: outstandingAmount,
          payment_status: paymentStatus,
          order_status: orderStatus,
        },
      ]);

      if (orderError) throw orderError;

      // Create Order Items
      const itemsToInsert = orderItems.map((item) => ({
        order_id: orderId,
        book_title: item.book_title,
        format: item.format,
        qty: item.qty,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      setNotification({ type: 'success', text: 'Pesanan berhasil dibuat!' });
      setTimeout(() => {
        router.push('/admin/orders');
      }, 1500);
    } catch (error: any) {
      setNotification({
        type: 'error',
        text: 'Gagal membuat pesanan: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-[#6D4C41] font-sans pb-20">
      {/* ===== HEADER ===== */}
      <header className="bg-[#FFF9F0]/90 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/orders"
              className="p-2 hover:bg-white rounded-full transition-all text-[#8B5E3C]"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-[#8B5E3C] tracking-tight">
              Input <span className="text-[#FF9E9E]">Pesanan</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4">
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ===== SECTION 1: CUSTOMER DATA ===== */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-orange-100 shadow-sm">
            <h2 className="text-lg font-black text-[#8B5E3C] mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                1
              </div>
              Data Pelanggan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-orange-300 uppercase tracking-wider mb-2">
                  No. Handphone (WhatsApp)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    placeholder="Contoh: 08123456789"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-2xl bg-[#F8F9FA] border-none focus:ring-2 focus:ring-orange-100 outline-none text-[#6D4C41] font-bold"
                  />
                  <button
                    type="button"
                    onClick={checkCustomer}
                    className="px-4 bg-orange-100 text-orange-600 rounded-2xl hover:bg-orange-200"
                    title="Cek Pelanggan"
                  >
                    {isSearchingCustomer ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-orange-300 uppercase tracking-wider mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border-none focus:ring-2 focus:ring-orange-100 outline-none text-[#6D4C41] font-bold"
                />
              </div>
            </div>
          </section>

          {/* ===== SECTION 2: ORDER ITEMS ===== */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-orange-100 shadow-sm">
            <h2 className="text-lg font-black text-[#8B5E3C] mb-6 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                  2
                </div>
                Rincian Buku
              </div>
              <button
                type="button"
                onClick={handleAddBook}
                className="text-sm px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold hover:bg-blue-100 flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> Tambah Buku
              </button>
            </h2>

            <div className="space-y-4">
              {orderItems.map((item, index) => {
                // ✅ Ambil format yang tersedia untuk judul yang dipilih
                const availableFormats = getFormatsForTitle(item.book_title);
                const hasTitle = item.book_title.trim().length > 0;

                return (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-[#F8F9FA] p-4 rounded-2xl relative"
                  >
                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBook(index)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-2 rounded-full hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-gray-400 mb-1">
                        Judul Buku
                      </label>
                      <input
                        type="text"
                        required
                        list={`booksList-${index}`}
                        value={item.book_title}
                        onChange={(e) =>
                          handleItemChange(index, 'book_title', e.target.value)
                        }
                        placeholder="Ketik atau pilih judul buku..."
                        className="w-full px-4 py-3 rounded-xl bg-white focus:ring-2 focus:ring-orange-100 outline-none text-[#6D4C41] font-bold"
                      />
                      {/* ✅ Datalist pakai judul unik (tanpa duplikat) */}
                      <datalist id={`booksList-${index}`}>
                        {uniqueTitles.map((title, i) => (
                          <option key={i} value={title} />
                        ))}
                      </datalist>
                    </div>

                    <div className="w-full md:w-48">
                      <label className="block text-xs font-bold text-gray-400 mb-1">
                        Format
                        {/* ✅ Tampilkan jumlah varian */}
                        {hasTitle && availableFormats.length > 0 && (
                          <span className="ml-1 text-[10px] text-orange-400">
                            ({availableFormats.length} varian)
                          </span>
                        )}
                      </label>
                      {/* ✅ Format dropdown dinamis dari database */}
                      <select
                        value={item.format}
                        onChange={(e) =>
                          handleItemChange(index, 'format', e.target.value)
                        }
                        disabled={!hasTitle || availableFormats.length === 0}
                        className={`w-full px-4 py-3 rounded-xl bg-white focus:ring-2 focus:ring-orange-100 outline-none text-[#6D4C41] font-bold ${!hasTitle || availableFormats.length === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                          }`}
                      >
                        {availableFormats.length === 0 ? (
                          <option value="">
                            {hasTitle ? '— Tidak ditemukan —' : '— Pilih judul dulu —'}
                          </option>
                        ) : (
                          availableFormats.map((f, i) => (
                            <option key={i} value={f.type}>
                              {f.type} — {formatRupiah(f.price)}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="w-full md:w-24">
                      <label className="block text-xs font-bold text-gray-400 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(index, 'qty', parseInt(e.target.value))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white focus:ring-2 focus:ring-orange-100 outline-none text-[#6D4C41] font-bold"
                      />
                    </div>

                    <div className="w-full md:w-48">
                      <label className="block text-xs font-bold text-gray-400 mb-1">
                        Harga Satuan
                        {/* ✅ Indikator harga otomatis */}
                        {item.price > 0 && hasTitle && (
                          <span className="ml-1 text-[10px] text-green-500">✓ auto</span>
                        )}
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'price',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white focus:ring-2 focus:ring-orange-100 outline-none text-[#6D4C41] font-bold"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-right">
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                Subtotal
              </div>
              <div className="text-2xl font-black text-[#8B5E3C]">
                {formatRupiah(totalAmount)}
              </div>
            </div>
          </section>

          {/* ===== SECTION 3: PAYMENT ===== */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-orange-100 shadow-sm">
            <h2 className="text-lg font-black text-[#8B5E3C] mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                3
              </div>
              Pembayaran
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <label className="block text-xs font-bold text-orange-300 uppercase tracking-wider mb-2">
                  Deposit Awal (DP)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={totalAmount}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F8F9FA] border-none focus:ring-2 focus:ring-orange-100 outline-none text-2xl text-[#8B5E3C] font-bold"
                />
              </div>

              <div className="bg-[#F8F9FA] p-6 rounded-2xl text-center shadow-inner">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Status Pembayaran
                </div>
                <div
                  className={`text-xl font-bold mb-4 ${paymentStatus === 'Lunas'
                    ? 'text-green-500'
                    : 'text-orange-500'
                    }`}
                >
                  {paymentStatus}
                </div>

                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Sisa Tagihan (Outstanding)
                </div>
                <div
                  className={`text-xl font-black ${outstandingAmount > 0 ? 'text-red-500' : 'text-green-500'
                    }`}
                >
                  {formatRupiah(outstandingAmount)}
                </div>
              </div>
            </div>
          </section>

          {/* ===== SECTION 4: STATUS PENGIRIMAN ===== */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-orange-100 shadow-sm">
            <h2 className="text-lg font-black text-[#8B5E3C] mb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                4
              </div>
              Status Pengiriman
            </h2>
            <p className="text-xs text-gray-400 mb-6 ml-10">
              Untuk pesanan baru, default status adalah{' '}
              <span className="font-bold text-blue-600">Diproses</span>. Ubah
              jika diperlukan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ORDER_STATUS_OPTIONS.map((option) => {
                const isSelected = orderStatus === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setOrderStatus(option.value)}
                    className={`relative p-5 rounded-2xl border-2 transition-all text-left group ${isSelected
                      ? `${option.color} ring-2 ring-offset-2 ring-current shadow-md`
                      : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      {option.icon}
                      <span className="font-bold text-sm">{option.label}</span>
                    </div>
                    <p
                      className={`text-xs ${isSelected ? 'opacity-80' : 'text-gray-400'
                        }`}
                    >
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Visual Status Flow */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span
                className={`px-3 py-1 rounded-full font-bold transition-all ${orderStatus === 'Diproses'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100'
                  }`}
              >
                Diproses
              </span>
              <span>→</span>
              <span
                className={`px-3 py-1 rounded-full font-bold transition-all ${orderStatus === 'Dikirim'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100'
                  }`}
              >
                Dikirim
              </span>
              <span>→</span>
              <span
                className={`px-3 py-1 rounded-full font-bold transition-all ${orderStatus === 'Delivered'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100'
                  }`}
              >
                Terkirim
              </span>
            </div>
          </section>

          {/* ===== ACTION BUTTONS ===== */}
          <div className="flex justify-end gap-4 mt-8">
            <Link
              href="/admin/orders"
              className="px-8 py-4 rounded-full font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
            >
              Batal
            </Link>
            <button
              disabled={loading}
              type="submit"
              className="px-8 py-4 rounded-full font-bold bg-[#FF9E9E] hover:bg-[#ff8585] text-white shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Simpan Pesanan
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
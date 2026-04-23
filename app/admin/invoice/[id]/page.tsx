'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../supabaseClient';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);

  // State ongkir (editable manual)
  const [shippingCost, setShippingCost] = useState(0);

  useEffect(() => {
    params.then((p) => setId(decodeURIComponent(p.id)));
  }, [params]);

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

  const fetchOrderDetails = async (orderId: string) => {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        customers (full_name, phone_number, address),
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (!orderError && orderData) {
      setOrder(orderData);
      // Load ongkir dari DB jika ada
      setShippingCost(orderData.shipping_cost || 0);
    }
    setLoading(false);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  const getShippingLabel = (status: string) => {
    switch (status) {
      case 'Delivered':
        return { text: 'Terkirim', style: 'border-green-500 text-green-600 bg-green-50' };
      case 'Dikirim':
        return { text: 'Dikirim', style: 'border-yellow-500 text-yellow-600 bg-yellow-50' };
      default:
        return { text: 'Diproses', style: 'border-blue-500 text-blue-600 bg-blue-50' };
    }
  };

  // Computed grand total (termasuk ongkir)
  const grandTotal = (order?.total_amount || 0) + shippingCost;
  const outstandingWithShipping = Math.max(0, grandTotal - (order?.deposit_amount || 0));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold mb-4">Pesanan tidak ditemukan</h1>
        <Link href="/admin/orders" className="text-blue-500 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>
    );
  }

  const shippingStatus = getShippingLabel(order.order_status);

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white font-sans text-black">
      {/* Non-printable Top Bar */}
      <div className="bg-white border-b border-gray-200 p-4 print:hidden flex justify-between items-center shadow-sm">
        <Link href="/admin/orders" className="flex items-center gap-2 text-gray-600 hover:text-black">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <label className="text-xs font-bold text-gray-500">Ongkir:</label>
            <input
              type="number"
              min="0"
              value={shippingCost}
              onChange={(e) => setShippingCost(Number(e.target.value))}
              placeholder="0"
              className="w-32 px-2 py-1 rounded border border-gray-200 text-sm font-bold text-[#8B5E3C] outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <button
            onClick={handlePrint}
            className="bg-black text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <Printer className="w-4 h-4" /> Cetak Invoice
          </button>
        </div>
      </div>

      {/* Printable Invoice Area */}
      <div className="invoice-page max-w-3xl mx-auto bg-white p-10 sm:p-14 print:p-0 print:shadow-none shadow-2xl rounded-2xl print:rounded-none flex flex-col mt-8 mb-8 print:m-0 print:border-none border border-gray-100">

        {/* Header Section */}
        <div className="flex justify-between items-center border-b-2 border-orange-100 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/icon.png" alt="Akinara Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#8B5E3C] tracking-tighter">Akinara Books</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Great Minds Start Between the Pages 💫</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase text-gray-200 tracking-widest">INVOICE</h2>
            <div className="mt-1 inline-block bg-orange-50 px-3 py-1 rounded border border-orange-100">
              <p className="font-bold text-sm text-[#8B5E3C]">#{order.id}</p>
            </div>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
              {new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            {/* ✅ TANGGAL JATUH TEMPO (Hanya tampil jika ada sisa tagihan) */}
            {outstandingWithShipping > 0 && (
              <p className="text-[10px] font-black text-red-400 mt-0.5 uppercase tracking-wider">
                Jatuh Tempo: {
                  order.due_date
                    ? new Date(order.due_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                    : new Date(new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                }
              </p>
            )}
          </div>
        </div>

        {/* Customer + Payment + Shipping Status + Alamat */}
        <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-300"></span> Tagihan Kepada
              </h3>
              <p className="font-black text-sm text-[#6D4C41]">{order.customers?.full_name}</p>
              <p className="text-xs font-bold text-gray-500">{order.customers?.phone_number}</p>
            </div>
            <div className="text-center">
              <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex justify-center items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span> Pembayaran
              </h3>
              <div className={`inline-block px-3 py-1 border font-black text-xs uppercase tracking-widest rounded ${order.payment_status === 'Lunas' ? 'border-green-500 text-green-600 bg-green-50' : 'border-orange-400 text-orange-500 bg-orange-50'}`}>
                {order.payment_status}
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex justify-end items-center gap-2">
                Pengiriman <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
              </h3>
              <div className={`inline-block px-3 py-1 border font-black text-xs uppercase tracking-widest rounded ${shippingStatus.style}`}>
                {shippingStatus.text}
              </div>
            </div>
          </div>

          {/* ✅ ALAMAT PENGIRIMAN */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Alamat Pengiriman
            </h3>
            <p className="text-[11px] font-bold text-gray-600 max-w-2xl leading-relaxed">
              {order.shipping_address || order.customers?.address || 'Detail alamat belum tersedia.'}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="rounded border border-gray-200 mb-6 text-xs">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 text-center w-10">No</th>
                <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 border-l border-gray-200">Deskripsi Item</th>
                <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-center border-b border-gray-200 border-l border-gray-200">Qty</th>
                <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-right border-b border-gray-200 border-l border-gray-200">Harga</th>
                <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-right border-b border-gray-200 border-l border-gray-200">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.order_items.map((item: any, index: number) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-center font-bold text-gray-300">{index + 1}</td>
                  <td className="px-4 py-3 border-l border-gray-100">
                    <p className="font-bold text-[#6D4C41]">{item.book_title}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{item.format}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-bold border-l border-gray-100">{item.qty}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-500 border-l border-gray-100">{formatRupiah(item.price)}</td>
                  <td className="px-4 py-3 text-right font-black text-[#8B5E3C] border-l border-gray-100">{formatRupiah(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ Payment & Summary — Diperkecil */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bank Accounts */}
          <div className="bg-gray-50 p-3 rounded border border-gray-100 flex flex-col justify-center">
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Transfer Bank</h4>
            <div className="grid grid-cols-2 gap-2 flex-1">
              <div>
                <p className="text-[10px] font-bold text-[#6D4C41]">Bank Mandiri</p>
                <p className="text-xs font-black text-[#8B5E3C] tracking-widest">1370021911884</p>
                <p className="text-[8px] font-bold text-gray-500 uppercase">A.N. Rifdah Nakhwah A</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6D4C41]">Bank Jago</p>
                <p className="text-xs font-black text-[#8B5E3C] tracking-widest">108895521347</p>
                <p className="text-[8px] font-bold text-gray-500 uppercase">A.N. Rifdah Nakhwah A</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-[8px] font-bold text-gray-400">
                ⓘ Konfirmasi via WhatsApp beserta bukti transfer.
              </p>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="flex flex-col">
            <div className="bg-orange-50 rounded p-3 border border-orange-100 flex-1 flex flex-col justify-center">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-gray-500 tracking-wider">Subtotal Buku</span>
                  <span className="font-black text-[#8B5E3C]">{formatRupiah(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-gray-500 tracking-wider">Ongkos Kirim</span>
                  <span className="font-black text-[#8B5E3C]">
                    {shippingCost > 0 ? formatRupiah(shippingCost) : 'Gratis'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-gray-500 tracking-wider">Deposit Masuk</span>
                  <span className="font-black text-green-600">- {formatRupiah(order.deposit_amount)}</span>
                </div>
                <div className="flex justify-between pt-1.5 mt-1 border-t-2 border-orange-200 text-xs">
                  <span className="font-black tracking-widest text-[#8B5E3C]">Sisa Tagihan</span>
                  <span className="font-black text-[#8B5E3C]">{formatRupiah(outstandingWithShipping)}</span>
                </div>
              </div>
            </div>
            <div className="mt-1 text-right">
              <p className="text-[8px] font-bold text-gray-400">
                Total: {order.order_items.reduce((sum: number, item: any) => sum + item.qty, 0)} buku
                ({order.order_items.length} judul)
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Footer — Ditarik lebih ke bawah mendekati ujung kertas */}
        <div className="mt-auto w-full -mb-4 sm:-mb-6 print:-mb-6 pt-8">
          <div className="border-t border-dashed border-gray-200 pt-5">
            <div className="text-center text-[10px] font-bold text-gray-400 tracking-widest">
              <p>Happy reading, little one! 📖✨</p>
              <p className="mt-1 normal-case text-gray-300 font-medium tracking-normal">
                Invoice ini diterbitkan secara otomatis oleh sistem dan sah sebagai bukti transaksi
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-gray-100">
              <a
                href="https://wa.me/6282314336969"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-green-600 transition-colors print:text-gray-400"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                0823-1433-6969
              </a>
              <span className="text-gray-200">|</span>
              <a
                href="https://instagram.com/akinarabooks"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-pink-600 transition-colors print:text-gray-400"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                @akinarabooks
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-page {
            width: 210mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 12mm 14mm !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            page-break-after: always;
            box-sizing: border-box !important;
          }
          #nala-chatbot,
          .nala-chatbot,
          [aria-label="chat widget"],
          .print\\:hidden {
            display: none !important;
          }
          table, tr, td, th {
            page-break-inside: avoid;
          }
          .invoice-page * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        @media screen {
          .invoice-page {
            min-height: calc(297mm - 20mm);
          }
        }
      `}</style>
    </div>
  );
} 
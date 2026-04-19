'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../supabaseClient';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [id, setId] = useState<string | null>(null);

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
        customers (full_name, phone_number),
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (!orderError && orderData) {
      setOrder(orderData);
    }
    setLoading(false);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white font-sans text-black">
      {/* Non-printable Top Bar */}
      <div className="bg-white border-b border-gray-200 p-4 print:hidden flex justify-between items-center shadow-sm">
        <Link href="/admin/orders" className="flex items-center gap-2 text-gray-600 hover:text-black">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </Link>
        <button
          onClick={handlePrint}
          className="bg-black text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Printer className="w-4 h-4" /> Cetak Invoice
        </button>
      </div>

      {/* ✅ Printable Invoice Area — dipaksa A4 saat print */}
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
          </div>
        </div>

        {/* Customer & Info Section */}
        <div className="grid grid-cols-2 gap-6 mb-6 bg-gray-50 p-4 rounded border border-gray-100">
          <div>
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-300"></span> Tagihan Kepada
            </h3>
            <p className="font-black text-sm text-[#6D4C41]">{order.customers.full_name}</p>
            <p className="text-xs font-bold text-gray-500">{order.customers.phone_number}</p>
          </div>
          <div className="text-right">
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex justify-end items-center gap-2">
              Status Pembayaran <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
            </h3>
            <div className={`inline-block px-3 py-1 border font-black text-xs uppercase tracking-widest rounded ${order.payment_status === 'Lunas' ? 'border-green-500 text-green-600 bg-green-50' : 'border-orange-400 text-orange-500 bg-orange-50'}`}>
              {order.payment_status}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="rounded border border-gray-200 mb-6 text-xs">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">Deskripsi Item</th>
                <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-center border-b border-gray-200 border-l border-gray-200">Qty</th>
                <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-right border-b border-gray-200 border-l border-gray-200">Harga</th>
                <th className="px-4 py-3 font-black text-gray-500 uppercase tracking-widest text-right border-b border-gray-200 border-l border-gray-200">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.order_items.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
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

        {/* Payment & Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          {/* Bank Accounts */}
          <div className="w-full sm:w-auto bg-gray-50 p-4 rounded border border-gray-100">
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Metode Pembayaran (Transfer Bank)</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-[#6D4C41]">Bank Mandiri</p>
                <p className="text-sm font-black text-[#8B5E3C] tracking-widest mt-0.5">1370021911884</p>
                <p className="text-[9px] font-bold text-gray-500 uppercase">A.N. Rifdah Nakhwah A</p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-bold text-[#6D4C41]">Bank Jago</p>
                <p className="text-sm font-black text-[#8B5E3C] tracking-widest mt-0.5">108895521347</p>
                <p className="text-[9px] font-bold text-gray-500 uppercase">A.N. Rifdah Nakhwah A</p>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="w-full sm:w-72 bg-orange-50 rounded p-4 border border-orange-100 shrink-0">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-500 tracking-wider">Total Harga</span>
                <span className="font-black text-[#8B5E3C]">{formatRupiah(order.total_amount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-500 tracking-wider">Deposit Masuk</span>
                <span className="font-black text-[#8B5E3C]">{formatRupiah(order.deposit_amount)}</span>
              </div>
              <div className="flex justify-between pt-3 mt-1 border-t border-orange-200 text-sm">
                <span className="font-black tracking-widest text-[#8B5E3C]">Sisa Tagihan</span>
                <span className="font-black text-[#8B5E3C]">{formatRupiah(order.outstanding_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Footer — mt-auto memaksa ke bawah dalam flex container */}
        <div className="mt-auto pt-6 border-t border-dashed border-gray-200 text-center text-[10px] font-bold text-gray-400 tracking-widest">
          <p>Happy reading, little one! 📖✨</p>
          <p className="mt-1 normal-case text-gray-300 font-medium tracking-normal">Invoice ini diterbitkan secara otomatis oleh sistem dan sah sebagai bukti transaksi</p>
        </div>
      </div>

      {/* ✅ Print styles — dipaksa A4 */}
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

          /* ✅ Sembunyikan semua elemen non-invoice */
          body > *:not(.print-root) {
            /* fallback — kita target via class di bawah */
          }

          /* ✅ Paksa invoice container jadi tepat 1 halaman A4 */
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

          /* ✅ Footer selalu di bawah */
          .invoice-page > div:last-child {
            margin-top: auto !important;
          }

          /* ✅ Sembunyikan chatbot & elemen non-print */
          #nala-chatbot, 
          .nala-chatbot, 
          [aria-label="chat widget"],
          .print\\:hidden {
            display: none !important;
          }

          /* ✅ Cegah page break di tengah tabel */
          table, tr, td, th {
            page-break-inside: avoid;
          }

          /* ✅ Reset background */
          .invoice-page * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        /* ✅ Preview di layar — simulasi A4 ratio */
        @media screen {
          .invoice-page {
            min-height: calc(297mm - 20mm); /* simulate A4 minus margin */
          }
        }
      `}</style>
    </div>
  );
}
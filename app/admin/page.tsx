'use client';

import React, {
  useState, useEffect, useMemo,
  useRef, useCallback
} from 'react';
import { supabase } from '../../supabaseClient';
import { generateSlug } from '../utils/slug';
import Papa from 'papaparse';
import {
  ArrowLeft, Save, Plus, Edit, Trash2,
  Search, BookOpen as BookOpenIcon, X, Filter,
  AlertCircle, CheckCircle, ChevronDown,
  Tag, Hash, User, Building2, Calendar,
  Clock, Image as ImageIcon, Globe, LogOut,
  Layers, Baby, BookText, RefreshCcw,
  Download, Upload, Star, Loader2, Package,
  Truck, Wallet, TrendingUp, ArrowRight
} from 'lucide-react';
import { Sticker, Youtube } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reveal from '../components/Reveal';
import BannerManager from './BannerManager';
import { PLACEHOLDER_IMAGE } from '../components/helpers/bookHelpers';

// ============================================================
// TIPE
// ============================================================
type BookStatus = 'READY' | 'PO' | 'BACKLIST';

type Book = {
  id?: number;
  title: string;
  price: number | string;
  type: string;
  age: string;
  status: string;
  category: string;
  publisher: string;
  author: string;
  pages: string;
  desc?: string;
  description?: string;
  image: string;
  eta: string;
  previewurl: string;
  is_highlight?: boolean;
  sticker_text?: string;
};

interface OrderSummary {
  total: number;
  diproses: number;
  dikirim: number;
  delivered: number;
  totalRevenue: number;
  totalOutstanding: number;
  lunas: number;
  dp: number;
}

// ============================================================
// KONSTANTA
// ============================================================
const STICKER_OPTIONS = ['NEW', 'HOT', 'SALE', 'BEST SELLER', 'COMING SOON'];
const FORMAT_OPTIONS = [
  'Board Book', 'Hardback', 'Paperback',
  'Lift-the-Flap', 'Picture Book', 'Interactive', 'Sound Book'
];
const INACTIVITY_LIMIT = 10 * 60 * 1000;
const MAX_HIGHLIGHTS = 4;
const REQUIRED_CSV_COLUMNS = ['title', 'price', 'status'];

const INITIAL_FORM: Book = {
  title: '', price: '', type: 'Board Book', age: '0-2 Thn',
  status: 'READY', category: 'Impor', publisher: '', author: '',
  pages: '', description: '', image: '', eta: 'Siap Kirim',
  previewurl: '', is_highlight: false, sticker_text: '',
};

const EMPTY_ORDER_SUMMARY: OrderSummary = {
  total: 0, diproses: 0, dikirim: 0, delivered: 0,
  totalRevenue: 0, totalOutstanding: 0, lunas: 0, dp: 0,
};

// ============================================================
// TIPE NOTIFIKASI
// ============================================================
interface AppNotification {
  type: 'success' | 'error';
  text: string;
}

// ============================================================
// HELPER
// ============================================================
const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(num);
};

// ============================================================
// ORDER SUMMARY WIDGET COMPONENT
// ============================================================
function OrderSummaryWidget({ summary, loading }: { summary: OrderSummary; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-orange-100 shadow-sm p-8 animate-pulse">
        <div className="h-5 w-48 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-orange-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-7 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#8B5E3C] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#FF9E9E]" />
            Ringkasan Pesanan
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Overview status semua pesanan</p>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1.5 text-xs font-bold text-[#FF9E9E] hover:text-[#ff8585] transition-colors group"
        >
          Lihat Semua
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="px-8 pb-7">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {/* Total Pesanan */}
          <div className="bg-gradient-to-br from-[#8B5E3C] to-[#a0724f] p-4 rounded-2xl text-white relative overflow-hidden">
            <div className="absolute -right-3 -top-3 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="text-[10px] font-bold uppercase tracking-wider text-orange-200 mb-1">
                Total Pesanan
              </div>
              <div className="text-3xl font-black">{summary.total}</div>
            </div>
          </div>

          {/* Diproses */}
          <Link
            href="/admin/orders"
            className="bg-blue-50 border border-blue-100 p-4 rounded-2xl hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">
              <Clock className="w-3 h-3" /> Diproses
            </div>
            <div className="text-3xl font-black text-blue-600">{summary.diproses}</div>
          </Link>

          {/* Dikirim */}
          <Link
            href="/admin/orders"
            className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl hover:bg-yellow-100 transition-colors group"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-yellow-500 mb-1">
              <Truck className="w-3 h-3" /> Dikirim
            </div>
            <div className="text-3xl font-black text-yellow-600">{summary.dikirim}</div>
          </Link>

          {/* Terkirim */}
          <Link
            href="/admin/orders"
            className="bg-green-50 border border-green-100 p-4 rounded-2xl hover:bg-green-100 transition-colors group"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-400 mb-1">
              <CheckCircle className="w-3 h-3" /> Terkirim
            </div>
            <div className="text-3xl font-black text-green-600">{summary.delivered}</div>
          </Link>
        </div>

        {/* Financial Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-[#FFF9F0] p-4 rounded-2xl border border-orange-100">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              <TrendingUp className="w-3 h-3" /> Total Omzet
            </div>
            <div className="text-lg font-black text-[#8B5E3C]">{formatRupiah(summary.totalRevenue)}</div>
          </div>

          <div className="bg-[#FFF9F0] p-4 rounded-2xl border border-orange-100">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              <Wallet className="w-3 h-3" /> Sisa Tagihan
            </div>
            <div className={`text-lg font-black ${summary.totalOutstanding > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {formatRupiah(summary.totalOutstanding)}
            </div>
          </div>

          <div className="bg-[#FFF9F0] p-4 rounded-2xl border border-orange-100">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              <CheckCircle className="w-3 h-3" /> Pembayaran
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-green-600">{summary.lunas} Lunas</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-black text-orange-500">{summary.dp} DP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function AdminPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<AppNotification | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [importOverwrite, setImportOverwrite] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Order Summary State
  const [orderSummary, setOrderSummary] = useState<OrderSummary>(EMPTY_ORDER_SUMMARY);
  const [orderSummaryLoading, setOrderSummaryLoading] = useState(true);

  // ============================================================
  // AUTO-DISMISS NOTIFIKASI
  // ============================================================
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // ESC untuk tutup modal
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Kunci body scroll saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  // ============================================================
  // AUTH & AUTO LOGOUT
  // ============================================================
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const performLogout = async (reason: string) => {
      await supabase.auth.signOut();
      localStorage.removeItem('admin_last_active');
      setNotification({ type: 'error', text: reason });
      setTimeout(() => router.push('/login'), 1500);
    };

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      localStorage.setItem('admin_last_active', Date.now().toString());
      inactivityTimer = setTimeout(() => {
        performLogout('Sesi habis karena tidak aktif. Redirecting...');
      }, INACTIVITY_LIMIT);
    };

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const lastActive = localStorage.getItem('admin_last_active');
      const now = Date.now();
      if (lastActive && now - parseInt(lastActive) > INACTIVITY_LIMIT) {
        await performLogout('Sesi berakhir (timeout). Silakan login kembali.');
        return;
      }

      localStorage.setItem('admin_last_active', now.toString());
      setIsChecking(false);
      fetchBooks();
      fetchOrderSummary();

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

  // ============================================================
  // DATA FETCHING
  // ============================================================
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('books').select('*');
    if (error) {
      setNotification({ type: 'error', text: 'Gagal memuat buku.' });
    } else {
      setBooks(data || []);
    }
    setLoading(false);
  }, []);

  const fetchOrderSummary = useCallback(async () => {
    setOrderSummaryLoading(true);
    try {
      // Pastikan session aktif sebelum query
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No active session, skipping order summary fetch');
        setOrderSummaryLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('order_status, payment_status, total_amount, outstanding_amount');

      if (error) {
        // Log detail error untuk debugging
        console.error('Order summary error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        // Jangan crash — tetap tampilkan widget dengan data kosong
        setOrderSummary(EMPTY_ORDER_SUMMARY);
        setOrderSummaryLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const summary: OrderSummary = {
          total: data.length,
          diproses: data.filter(
            (o) => !o.order_status || o.order_status === 'Diproses' || o.order_status === 'Active'
          ).length,
          dikirim: data.filter((o) => o.order_status === 'Dikirim').length,
          delivered: data.filter((o) => o.order_status === 'Delivered').length,
          totalRevenue: data.reduce((sum, o) => sum + (o.total_amount || 0), 0),
          totalOutstanding: data.reduce((sum, o) => sum + (o.outstanding_amount || 0), 0),
          lunas: data.filter((o) => o.payment_status === 'Lunas').length,
          dp: data.filter((o) => o.payment_status !== 'Lunas').length,
        };
        setOrderSummary(summary);
      } else {
        setOrderSummary(EMPTY_ORDER_SUMMARY);
      }
    } catch (err) {
      console.error('Unexpected error fetching order summary:', err);
      setOrderSummary(EMPTY_ORDER_SUMMARY);
    }
    setOrderSummaryLoading(false);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('admin_last_active');
    router.push('/login');
  };

  // ============================================================
  // FILTER & SORT STATE
  // ============================================================
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterAge, setFilterAge] = useState('Semua');
  const [filterPublisher, setFilterPublisher] = useState('Semua');
  const [filterType, setFilterType] = useState('Semua');
  const [sortBy, setSortBy] = useState('terbaru');

  const handleResetFilter = useCallback(() => {
    setSearchQuery('');
    setFilterStatus('Semua');
    setFilterCategory('Semua');
    setFilterAge('Semua');
    setFilterPublisher('Semua');
    setFilterType('Semua');
    setSortBy('terbaru');
  }, []);

  // ============================================================
  // FORM STATE
  // ============================================================
  const [formData, setFormData] = useState<Book>(INITIAL_FORM);
  const [isEditing, setIsEditing] = useState(false);

  // ============================================================
  // EXPORT CSV
  // ============================================================
  const handleExportCSV = useCallback(() => {
    if (books.length === 0) {
      setNotification({ type: 'error', text: 'Tidak ada data untuk diexport.' });
      return;
    }
    const csv = Papa.unparse(books.map(({ id, ...rest }) => rest));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `katalog-akinara-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotification({ type: 'success', text: 'Export berhasil!' });
  }, [books]);

  // ============================================================
  // IMPORT CSV
  // ============================================================
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) =>
        header.trim().toLowerCase()
          .replace(/^"|"$/g, '')
          .replace(/[\uFEFF]/g, ''),

      complete: async (results) => {
        const rawData = results.data as Record<string, string>[];

        if (rawData.length === 0) {
          setNotification({ type: 'error', text: 'File CSV kosong.' });
          setLoading(false);
          return;
        }

        const csvColumns = Object.keys(rawData[0]);
        const missingColumns = REQUIRED_CSV_COLUMNS.filter(
          (col) => !csvColumns.includes(col)
        );

        if (missingColumns.length > 0) {
          setNotification({
            type: 'error',
            text: `CSV tidak valid. Kolom wajib tidak ditemukan: ${missingColumns.join(', ')}`,
          });
          setLoading(false);
          return;
        }

        const { data: existingBooks, error: fetchError } = await supabase
          .from('books')
          .select('id, title, type');

        if (fetchError) {
          setNotification({ type: 'error', text: 'Gagal mengambil data lama.' });
          setLoading(false);
          return;
        }

        const dbMap = new Map<string, number>();
        existingBooks?.forEach((b) => {
          if (b.title) {
            const key = `${b.title.trim().toLowerCase()}|${(b.type || 'board book').trim().toLowerCase()}`;
            dbMap.set(key, b.id);
          }
        });

        const cleanData = rawData.map((row) => {
          const getVal = (key: string) => row[key] || '';
          const cleanTitle = (getVal('title') || 'Tanpa Judul').trim();
          const cleanType = (getVal('type') || 'Board Book').trim();
          const key = `${cleanTitle.toLowerCase()}|${cleanType.toLowerCase()}`;
          const existingId = dbMap.get(key);

          return {
            id: existingId,
            title: cleanTitle,
            slug: generateSlug(cleanTitle, cleanType),
            price: row.price
              ? parseInt(String(row.price).replace(/[^0-9]/g, ''))
              : 0,
            author: getVal('author'),
            publisher: getVal('publisher'),
            category: getVal('category') || 'Impor',
            type: cleanType,
            age: getVal('age'),
            status: getVal('status') || 'READY',
            pages: getVal('pages'),
            eta: getVal('eta'),
            previewurl: getVal('previewurl'),
            image: getVal('image'),
            desc: getVal('desc') || getVal('description') || '',
            is_highlight: false,
            sticker_text: getVal('sticker_text') || getVal('sticker') || '',
          };
        });

        const uniqueMap = new Map();
        cleanData.forEach((item) => {
          if (item.title !== 'Tanpa Judul' && item.price > 0) {
            const key = `${item.title.toLowerCase()}|${item.type.toLowerCase()}`;
            uniqueMap.set(key, item);
          }
        });

        const finalPayload = Array.from(uniqueMap.values());
        const toInsert: Record<string, unknown>[] = [];
        const toUpdate: Record<string, unknown>[] = [];
        let skippedCount = 0;

        finalPayload.forEach((item) => {
          if (item.id) {
            // Hanya update jika overwrite diaktifkan
            if (importOverwrite) {
              toUpdate.push(item);
            } else {
              skippedCount++;
            }
          } else {
            const { id, ...withoutId } = item;
            toInsert.push(withoutId);
          }
        });

        const errors: string[] = [];
        let insertCount = 0;
        let updateCount = 0;

        if (toInsert.length > 0) {
          const { error } = await supabase.from('books').insert(toInsert);
          if (error) errors.push(`Insert: ${error.message}`);
          else insertCount = toInsert.length;
        }

        if (toUpdate.length > 0) {
          const { error } = await supabase.from('books').upsert(toUpdate);
          if (error) errors.push(`Update: ${error.message}`);
          else updateCount = toUpdate.length;
        }

        if (errors.length > 0) {
          setNotification({ type: 'error', text: errors.join(' | ') });
        } else if (insertCount + updateCount > 0) {
          const parts = [`${insertCount} buku baru`, `${updateCount} diupdate`];
          if (skippedCount > 0) parts.push(`${skippedCount} dilewati`);
          setNotification({
            type: 'success',
            text: `Import berhasil! ${parts.join(', ')}.`,
          });
          fetchBooks();
        } else {
          setNotification({ type: 'error', text: 'Tidak ada data valid.' });
        }

        setLoading(false);
      },

      error: (err) => {
        setNotification({ type: 'error', text: `CSV Error: ${err.message}` });
        setLoading(false);
      },
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ============================================================
  // FILTER OPTIONS
  // ============================================================
  const uniquePublishers = useMemo(
    () => [
      'Semua',
      ...Array.from(
        new Set(
          books
            .map((b) => b.publisher)
            .filter((x): x is string => typeof x === 'string' && x.length > 0)
        )
      ).sort(),
    ],
    [books]
  );

  const uniqueAges = useMemo(
    () => [
      'Semua',
      ...Array.from(
        new Set(
          books
            .map((b) => b.age)
            .filter((x): x is string => typeof x === 'string' && x.length > 0)
        )
      ).sort(),
    ],
    [books]
  );

  const uniqueTypes = useMemo(
    () => [
      'Semua',
      ...Array.from(
        new Set(
          books
            .map((b) => b.type)
            .filter((x): x is string => typeof x === 'string' && x.length > 0)
        )
      ).sort(),
    ],
    [books]
  );

  // ============================================================
  // FILTERED BOOKS
  // ============================================================
  const filteredBooks = useMemo(() => {
    const result = books.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        (b.title || '').toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q);
      const matchStatus = filterStatus === 'Semua' || b.status === filterStatus;
      const matchCategory =
        filterCategory === 'Semua' || b.category === filterCategory;
      const matchAge = filterAge === 'Semua' || b.age === filterAge;
      const matchPublisher =
        filterPublisher === 'Semua' || b.publisher === filterPublisher;
      const matchType = filterType === 'Semua' || b.type === filterType;
      return (
        matchSearch && matchStatus && matchCategory &&
        matchAge && matchPublisher && matchType
      );
    });

    return result.sort((a, b) => {
      if (sortBy === 'terbaru') return (b.id || 0) - (a.id || 0);
      if (sortBy === 'terlama') return (a.id || 0) - (b.id || 0);
      if (sortBy === 'az') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'za') return (b.title || '').localeCompare(a.title || '');
      return 0;
    });
  }, [
    books, searchQuery, filterStatus, filterCategory,
    filterAge, filterPublisher, filterType, sortBy,
  ]);

  // ============================================================
  // MODAL HANDLERS
  // ============================================================
  const openEditModal = useCallback((book: Book) => {
    setFormData({
      ...book,
      description: book.desc ?? book.description ?? '',
      is_highlight: book.is_highlight ?? false,
      sticker_text: book.sticker_text ?? '',
    });
    setIsEditing(true);
    setIsModalOpen(true);
  }, []);

  const openAddModal = useCallback(() => {
    setFormData(INITIAL_FORM);
    setIsEditing(false);
    setIsModalOpen(true);
  }, []);

  const handleHighlightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isTurningOn = e.target.checked;
    if (isTurningOn) {
      const currentCount = books.filter((b) => b.is_highlight).length;
      const isAlreadyActive = books.find(
        (b) => b.id === formData.id
      )?.is_highlight;

      if (!isAlreadyActive && currentCount >= MAX_HIGHLIGHTS) {
        setNotification({
          type: 'error',
          text: `Batas ${MAX_HIGHLIGHTS} highlight tercapai! Uncheck salah satu buku highlight yang ada dulu.`,
        });
        return;
      }
    }
    setFormData({ ...formData, is_highlight: isTurningOn });
  };

  // ============================================================
  // SAVE
  // ============================================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const bookTitle = formData.title || 'Tanpa Judul';
      const payload = {
        title: bookTitle,
        slug: generateSlug(bookTitle, formData.type || 'Board Book'),
        price: formData.price ? parseInt(formData.price.toString()) : 0,
        type: formData.type || 'Board Book',
        age: formData.age || '',
        status: formData.status || 'READY',
        category: formData.category || 'Impor',
        publisher: formData.publisher || '',
        author: formData.author || '',
        pages: formData.pages || '',
        image: formData.image || '',
        eta: formData.eta || '',
        previewurl: formData.previewurl || '',
        desc: formData.description || '',
        is_highlight: formData.is_highlight || false,
        sticker_text: formData.sticker_text || '',
      };

      let error;
      if (isEditing && formData.id) {
        ({ error } = await supabase
          .from('books')
          .update(payload)
          .eq('id', formData.id));
      } else {
        ({ error } = await supabase.from('books').insert([payload]));
      }

      if (error) throw new Error(error.message);

      setIsModalOpen(false);
      fetchBooks();
      setNotification({ type: 'success', text: 'Berhasil disimpan!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      setNotification({ type: 'error', text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) {
      setNotification({ type: 'error', text: `Gagal hapus: ${error.message}` });
    } else {
      setNotification({ type: 'success', text: 'Buku berhasil dihapus.' });
      fetchBooks();
    }
    setConfirmDeleteId(null);
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8B5E3C] mb-4" />
        <p className="text-[#8B5E3C] font-black uppercase tracking-widest text-xs">
          Mengecek Akses Admin...
        </p>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-[#FFF9F0] text-[#6D4C41] font-sans pb-20 overflow-x-hidden text-sm">
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ===== NAVBAR ===== */}
      <header className="bg-[#FFF9F0]/90 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/katalog"
              className="p-2 hover:bg-white rounded-full transition-all text-[#8B5E3C]"
              aria-label="Kembali ke katalog"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-[#8B5E3C] tracking-tight">
              Akinara<span className="text-[#FF9E9E]">Admin</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Import CSV + Overwrite Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleImportClick}
                title="Import CSV"
                aria-label="Import CSV"
                className="p-2.5 bg-white border border-green-200 text-green-600 hover:bg-green-50 rounded-full transition-all shadow-sm"
              >
                <Upload className="w-5 h-5" />
              </button>
              <label
                className="flex items-center gap-1.5 cursor-pointer select-none group"
                title="Jika dicentang, buku yang sudah ada di database akan di-overwrite saat import CSV"
              >
                <input
                  type="checkbox"
                  checked={importOverwrite}
                  onChange={(e) => setImportOverwrite(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 accent-green-600 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-600 transition-colors whitespace-nowrap">
                  Overwrite
                </span>
              </label>
            </div>

            <button
              onClick={handleExportCSV}
              title="Export CSV"
              aria-label="Export CSV"
              className="p-2.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full transition-all shadow-sm"
            >
              <Download className="w-5 h-5" />
            </button>

            <Link
              href="/admin/orders"
              className="bg-orange-100 hover:bg-orange-200 text-[#8B5E3C] px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 relative"
            >
              <Package className="w-4 h-4" /> Orders
              {/* Badge: jumlah pesanan aktif */}
              {orderSummary.diproses + orderSummary.dikirim > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {orderSummary.diproses + orderSummary.dikirim}
                </span>
              )}
            </Link>

            <button
              onClick={openAddModal}
              className="bg-[#FF9E9E] hover:bg-[#ff8585] text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>

            <button
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="p-2.5 bg-white border border-orange-100 text-[#8B5E3C] hover:text-red-500 rounded-full transition-all shadow-sm relative"
            >
              <LogOut className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="max-w-[96%] mx-auto py-8">
        {/* Notification */}
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

        {/* ===== ORDER SUMMARY WIDGET ===== */}
        <Reveal>
          <div className="mb-10">
            <OrderSummaryWidget
              summary={orderSummary}
              loading={orderSummaryLoading}
            />
          </div>
        </Reveal>

        {/* Banner Manager */}
        <Reveal>
          <div className="mb-10">
            <BannerManager />
          </div>
        </Reveal>

        {/* ===== FILTER ===== */}
        <Reveal>
          <section className="bg-white p-6 rounded-[2.5rem] border border-orange-100 shadow-sm mb-10">
            <div className="flex flex-col xl:flex-row gap-4 items-center">
              <div className="flex-1 w-full flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Cari buku..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F8F9FA] border-none focus:ring-2 focus:ring-orange-100 outline-none text-[#6D4C41] font-bold transition-all"
                  />
                </div>
                <button
                  onClick={handleResetFilter}
                  title="Reset Filter"
                  aria-label="Reset filter"
                  className="p-3.5 bg-orange-50 text-[#FF9E9E] hover:bg-[#FF9E9E] hover:text-white rounded-2xl transition-all shadow-sm border border-orange-100"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full xl:w-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { val: filterStatus, set: setFilterStatus, opts: ['Semua', 'READY', 'PO', 'BACKLIST'], label: 'Status Stok' },
                  { val: filterCategory, set: setFilterCategory, opts: ['Semua', 'Impor', 'Lokal'], label: 'Jenis Buku' },
                  { val: filterAge, set: setFilterAge, opts: uniqueAges, label: 'Usia' },
                  { val: filterPublisher, set: setFilterPublisher, opts: uniquePublishers, label: 'Penerbit' },
                  { val: filterType, set: setFilterType, opts: uniqueTypes, label: 'Format' },
                  {
                    val: sortBy, set: setSortBy,
                    opts: ['terbaru', 'terlama', 'az', 'za'],
                    labels: ['Terbaru', 'Terlama', 'A - Z', 'Z - A'],
                    label: 'Urutan'
                  },
                ].map((f, i) => (
                  <select
                    key={i}
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    className="px-4 py-3.5 rounded-2xl bg-[#F8F9FA] text-[#8B5E3C] font-bold outline-none border-none focus:ring-2 focus:ring-orange-50 text-xs cursor-pointer"
                  >
                    {f.opts.map((opt, oi) => (
                      <option key={opt} value={opt}>
                        {(f as any).labels ? (f as any).labels[oi] : (opt === 'Semua' ? f.label : opt)}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ===== TABEL BUKU ===== */}
        <div className="bg-white rounded-[2.5rem] border border-orange-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-orange-50/30 border-b border-orange-100">
                <th className="px-6 py-5 text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest text-center">ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest">Detail Katalog</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest text-center">Harga</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-200 mx-auto mb-2" />
                    <p className="text-orange-200 font-bold uppercase text-xs">Loading...</p>
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-gray-400 font-bold">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-[#FFF9F0] transition-all">
                    <td className="px-6 py-4 text-xs font-bold text-gray-300 text-center">
                      #{book.id}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-5">
                        <div className="relative shrink-0">
                          <img
                            src={book.image || PLACEHOLDER_IMAGE}
                            alt={book.title}
                            className="w-14 h-20 object-cover rounded-xl shadow-md bg-gray-100"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          {book.sticker_text && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold shadow-sm z-10 border border-white">
                              <Sticker className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="font-black text-gray-800 text-base leading-tight">
                              {book.title}
                            </div>
                            {book.is_highlight && (
                              <span className="bg-yellow-100 text-yellow-600 text-[9px] px-1.5 py-0.5 rounded font-bold border border-yellow-200">
                                <Star className="w-2.5 h-2.5 inline" /> Featured
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-orange-400 font-black uppercase tracking-widest flex items-center gap-2">
                            <User className="w-3 h-3" /> {book.author || 'No Author'}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[9px]">
                            <span className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-md font-bold">
                              <Layers className="w-2.5 h-2.5" /> {book.category}
                            </span>
                            <span className="flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-1 rounded-md font-bold">
                              <Building2 className="w-2.5 h-2.5" /> {book.publisher || '-'}
                            </span>
                            <span className="flex items-center gap-1 bg-orange-50 text-[#8B5E3C] px-2 py-1 rounded-md border border-orange-200 font-bold">
                              <Baby className="w-2.5 h-2.5" /> {book.age}
                            </span>
                            <span className="flex items-center gap-1 bg-[#8B5E3C] text-white px-2 py-1 rounded-md font-bold">
                              <BookText className="w-2.5 h-2.5" /> {book.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-base font-black text-[#FF9E9E] text-center italic">
                      Rp {Number(book.price).toLocaleString('id-ID')}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-sm ${book.status === 'READY'
                          ? 'bg-green-100 text-green-700'
                          : book.status === 'PO'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                          }`}
                      >
                        {book.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(book)}
                          aria-label="Edit buku"
                          className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        {confirmDeleteId === book.id ? (
                          <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-xl border border-red-200">
                            <span className="text-[10px] text-red-600 font-bold">Hapus?</span>
                            <button
                              onClick={() => book.id && handleDelete(book.id)}
                              className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg font-bold hover:bg-red-600"
                            >
                              Ya
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] text-slate-500 font-bold px-1"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => book.id && setConfirmDeleteId(book.id)}
                            aria-label="Hapus buku"
                            className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ===== MODAL FORM ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={isEditing ? 'Edit buku' : 'Tambah buku baru'}
            className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-10 py-6 border-b border-orange-50 flex justify-between items-center bg-[#FFF9F0]/50 shrink-0">
              <h2 className="text-2xl font-black text-[#8B5E3C] tracking-tighter uppercase">
                {isEditing ? 'Update Katalog' : 'Input Katalog Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup modal"
                className="p-3 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all"
              >
                <X />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-10 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Tag className="w-3 h-3" /> Judul Lengkap Buku *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold text-lg"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Harga Jual (Rp) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold text-lg"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <BookOpenIcon className="w-3 h-3" /> Format / Material
                  </label>
                  <select
                    value={formData.type || 'Board Book'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 font-bold text-gray-900 outline-none"
                  >
                    {FORMAT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Status Katalog
                  </label>
                  <select
                    value={formData.status || 'READY'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 font-bold text-gray-900 outline-none"
                  >
                    <option value="READY">READY STOCK</option>
                    <option value="PO">PRE-ORDER</option>
                    <option value="BACKLIST">BACKLIST</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Filter className="w-3 h-3" /> Jenis / Asal
                  </label>
                  <select
                    value={formData.category || 'Impor'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 font-bold text-gray-900 outline-none"
                  >
                    <option value="Impor">BUKU IMPOR</option>
                    <option value="Lokal">BUKU LOKAL</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <User className="w-3 h-3" /> Penulis / Kreator
                  </label>
                  <input
                    type="text"
                    value={formData.author || ''}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Building2 className="w-3 h-3" /> Penerbit / Publisher
                  </label>
                  <input
                    type="text"
                    value={formData.publisher || ''}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Baby className="w-3 h-3" /> Rekomendasi Usia
                  </label>
                  <input
                    type="text"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Misal: 3-5 Tahun"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Youtube className="w-3 h-3" /> Preview URL (Video)
                  </label>
                  <input
                    type="text"
                    value={formData.previewurl || ''}
                    onChange={(e) => setFormData({ ...formData, previewurl: e.target.value })}
                    placeholder="Link YouTube / Instagram"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Estimasi Kedatangan (ETA)
                  </label>
                  <input
                    type="text"
                    value={formData.eta || ''}
                    onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <BookText className="w-3 h-3" /> Spesifikasi Halaman
                  </label>
                  <input
                    type="text"
                    value={formData.pages || ''}
                    onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                    placeholder="Misal: 32 pages, full colour"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Link Cover Gambar Utama *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    Deskripsi Lengkap / Sinopsis
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold leading-relaxed"
                  />
                </div>

                {/* Highlight & Sticker */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Checkbox Highlight */}
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center gap-4 hover:bg-orange-100 transition-colors">
                    <input
                      type="checkbox"
                      id="isHighlight"
                      checked={formData.is_highlight || false}
                      onChange={handleHighlightChange}
                      className="w-6 h-6 rounded focus:ring-orange-500 border-gray-300 cursor-pointer accent-[#8B5E3C]"
                    />
                    <label htmlFor="isHighlight" className="cursor-pointer">
                      <span className="flex items-center gap-2 font-black text-[#8B5E3C] uppercase text-xs tracking-widest">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-600" />
                        Highlight di Homepage?
                      </span>
                      <span className="text-xs text-gray-500 font-medium mt-1 block">
                        Jika dicentang, buku ini tampil di Mini Katalog halaman utama.
                        (Maks. {MAX_HIGHLIGHTS} buku)
                      </span>
                    </label>
                  </div>

                  {/* Dropdown Sticker */}
                  <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100 hover:bg-pink-100 transition-colors">
                    <label className="flex items-center gap-2 font-black text-[#8B5E3C] uppercase text-xs tracking-widest mb-2">
                      <Sticker className="w-4 h-4 text-pink-500" />
                      Sticker Label (Pojok Kanan)
                    </label>
                    <select
                      value={formData.sticker_text || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, sticker_text: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white text-sm font-bold text-[#8B5E3C]"
                    >
                      <option value="">Tanpa Sticker</option>
                      {STICKER_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      Pilih label sticker yang ingin ditampilkan di kartu buku.
                    </span>
                  </div>
                </div>

              </div>{/* end grid */}

              {/* Tombol aksi */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-[#8B5E3C] hover:bg-[#6D4C41] text-white py-5 rounded-2xl font-black text-lg shadow-xl disabled:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isSaving ? 'MENYIMPAN...' : 'SIMPAN KE DATABASE'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 bg-gray-100 text-gray-400 font-black rounded-2xl uppercase tracking-widest text-xs"
                >
                  Batal
                </button>
              </div>

            </form>{/* end form */}
          </div>{/* end modal inner */}
        </div>
      )}{/* end isModalOpen */}

    </div>
  );
}
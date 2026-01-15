'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import Papa from 'papaparse'; 
import { 
  ArrowLeft, Save, Plus, Edit, Trash2, 
  Search, BookOpen as BookOpenIcon, X, Filter, AlertCircle, CheckCircle, ChevronDown, 
  SortAsc, Tag, Hash, User, Building2, Calendar, Clock, Image as ImageIcon, FileText, Youtube, Globe, LogOut,
  Layers, Baby, BookText, RefreshCcw, Download, Upload, Timer
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- 1. UTILITY COMPONENT ---
const Reveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { 
      if (entry.isIntersecting) { setIsVisible(true); if (ref.current) observer.unobserve(ref.current); } 
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);
  return <div ref={ref} className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

// --- 2. TIPE DATA ---
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
};

// --- 3. KOMPONEN UTAMA ---
export default function AdminPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true); 
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // Ref untuk input file import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- KONFIGURASI AUTO LOGOUT ---
  // 15 Menit = 15 * 60 * 1000 milidetik
  const INACTIVITY_LIMIT = 10 * 60 * 1000; 

  // --- LOGIKA SATPAM & AUTO LOGOUT ---
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsChecking(false);
        fetchBooks();
        startInactivityTimer(); // Mulai timer saat user terkonfirmasi login
      }
    };

    // Fungsi Logout Otomatis
    const handleAutoLogout = async () => {
      // Cek apakah user masih di halaman ini (mencegah error memory leak)
      await supabase.auth.signOut();
      alert("Sesi Anda telah habis karena tidak ada aktivitas. Silakan login kembali.");
      router.push('/login');
    };

    // Fungsi Reset Timer (Dipanggil tiap ada gerakan)
    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleAutoLogout, INACTIVITY_LIMIT);
    };

    // Fungsi Memasang Pendengar Gerakan (Event Listeners)
    const startInactivityTimer = () => {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('click', resetTimer);
      window.addEventListener('keypress', resetTimer);
      window.addEventListener('scroll', resetTimer); // Tambahan: scroll juga dihitung aktivitas
      resetTimer(); // Set timer awal
    };

    checkUser();

    // Bersih-bersih saat user meninggalkan halaman (Cleanup)
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [router]);

  // --- STATE FILTER & SORT ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterAge, setFilterAge] = useState('Semua');
  const [filterPublisher, setFilterPublisher] = useState('Semua');
  const [filterType, setFilterType] = useState('Semua');
  const [sortBy, setSortBy] = useState('terbaru'); 

  // --- FUNGSI RESET FILTER ---
  const handleResetFilter = () => {
    setSearchQuery('');
    setFilterStatus('Semua');
    setFilterCategory('Semua');
    setFilterAge('Semua');
    setFilterPublisher('Semua');
    setFilterType('Semua');
    setSortBy('terbaru');
  };

  // --- STATE FORM ---
  const initialForm: Book = {
    title: '', price: '', type: 'Board Book', age: '0-2 Thn',
    status: 'READY', category: 'Impor', publisher: '', author: '',
    pages: '', description: '', image: '', eta: 'Siap Kirim', previewurl: ''
  };
  const [formData, setFormData] = useState<Book>(initialForm);
  const [isEditing, setIsEditing] = useState(false);

  const formatOptions = ["Board Book", "Hardback", "Paperback", "Lift-the-Flap", "Picture Book", "Interactive", "Sound Book"];

  async function fetchBooks() {
    setLoading(true);
    const { data, error } = await supabase.from('books').select('*');
    if (!error) setBooks(data || []);
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- FITUR EXPORT CSV ---
  const handleExportCSV = () => {
    if (books.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }
    const csv = Papa.unparse(books.map(({ id, ...rest }) => rest));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `katalog-akinara-backup-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FITUR IMPORT CSV ---
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

// --- FITUR IMPORT CSV (STRATEGI PECAH JALUR: INSERT vs UPDATE) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        return header.trim().toLowerCase().replace(/^"|"$/g, '').replace(/[\uFEFF]/g, ""); 
      },
      complete: async (results) => {
        const rawData = results.data as any[];

        // 1. Ambil Data Lama
        const { data: existingBooks, error: fetchError } = await supabase
          .from('books')
          .select('id, title, type');
        
        if (fetchError) {
          setMsg({ type: 'error', text: 'Gagal mengambil data lama.' });
          setLoading(false);
          return;
        }

        // 2. Buat Kamus Composite Key (Judul|Tipe)
        const dbMap = new Map();
        existingBooks?.forEach(b => {
          if (b.title) {
            const key = `${b.title.trim().toLowerCase()}|${(b.type || 'board book').trim().toLowerCase()}`;
            dbMap.set(key, b.id);
          }
        });

        // 3. Proses & Bersihkan Data CSV
        const cleanData = rawData.map(row => {
           const getVal = (key: string) => row[key] || '';
           const cleanTitle = (getVal('title') || 'Tanpa Judul').trim();
           const cleanType = (getVal('type') || 'Board Book').trim(); 
           
           const key = `${cleanTitle.toLowerCase()}|${cleanType.toLowerCase()}`;
           const existingId = dbMap.get(key);

           return {
             id: existingId, // Bisa undefined (baru) atau angka (lama)
             title: cleanTitle,
             price: row.price ? parseInt(String(row.price).replace(/[^0-9]/g, '')) : 0,
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
           };
        });

        // 4. Filter Duplikat Lokal (Ambil data paling bawah di CSV jika ada kembar)
        const uniqueDataMap = new Map();
        cleanData.forEach(item => {
            if (item.title !== 'Tanpa Judul' && item.price > 0) {
                const key = `${item.title.toLowerCase()}|${item.type.toLowerCase()}`;
                uniqueDataMap.set(key, item);
            }
        });
        const finalPayload = Array.from(uniqueDataMap.values());

        // 5. MEMISAHKAN ANTARA INSERT DAN UPDATE (SOLUSI INTI)
        const toInsert: any[] = [];
        const toUpdate: any[] = [];

        finalPayload.forEach(item => {
            if (item.id) {
                // Punya ID -> Masuk jalur UPDATE
                toUpdate.push(item);
            } else {
                // Tidak punya ID -> Masuk jalur INSERT
                // Wajib membuang properti 'id' agar tidak error "null constraint"
                const { id, ...itemWithoutId } = item; 
                toInsert.push(itemWithoutId);
            }
        });

        // 6. Eksekusi ke Database
        let successCount = 0;
        let errors = [];

        // Jalankan Insert (Jika ada)
        if (toInsert.length > 0) {
            const { error: insertError } = await supabase.from('books').insert(toInsert);
            if (insertError) errors.push(`Insert Error: ${insertError.message}`);
            else successCount += toInsert.length;
        }

        // Jalankan Update (Jika ada) - Gunakan upsert untuk update batch
        if (toUpdate.length > 0) {
            const { error: updateError } = await supabase.from('books').upsert(toUpdate);
            if (updateError) errors.push(`Update Error: ${updateError.message}`);
            else successCount += toUpdate.length;
        }

        // 7. Laporan Hasil
        if (errors.length > 0) {
            setMsg({ type: 'error', text: errors.join(" | ") });
        } else if (successCount > 0) {
            setMsg({ type: 'success', text: `Berhasil! ${toInsert.length} Baru, ${toUpdate.length} Update.` });
            fetchBooks();
        } else {
            setMsg({ type: 'error', text: 'Tidak ada data valid untuk diproses.' });
        }
        
        setLoading(false);
      },
      error: (error) => {
        setMsg({ type: 'error', text: `CSV Error: ${error.message}` });
        setLoading(false);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uniquePublishers = useMemo(() => ['Semua', ...Array.from(new Set(books.map(b => b.publisher).filter(Boolean))).sort()], [books]);
  const uniqueAges = useMemo(() => ['Semua', ...Array.from(new Set(books.map(b => b.age).filter(Boolean))).sort()], [books]);
  const uniqueTypes = useMemo(() => ['Semua', ...Array.from(new Set(books.map(b => b.type).filter(Boolean))).sort()], [books]);

  const filteredBooks = useMemo(() => {
    let result = books.filter(b => {
      const matchSearch = (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (b.author || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'Semua' || b.status === filterStatus;
      const matchCategory = filterCategory === 'Semua' || b.category === filterCategory;
      const matchAge = filterAge === 'Semua' || b.age === filterAge;
      const matchPublisher = filterPublisher === 'Semua' || b.publisher === filterPublisher;
      const matchType = filterType === 'Semua' || b.type === filterType;
      return matchSearch && matchStatus && matchCategory && matchAge && matchPublisher && matchType;
    });

    return result.sort((a, b) => {
      if (sortBy === 'terbaru') return (b.id || 0) - (a.id || 0);
      if (sortBy === 'terlama') return (a.id || 0) - (b.id || 0);
      if (sortBy === 'az') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'za') return (b.title || '').localeCompare(a.title || '');
      return 0;
    });
  }, [books, searchQuery, filterStatus, filterCategory, filterAge, filterPublisher, filterType, sortBy]);

  const openEditModal = (book: Book) => {
    setFormData({
      ...book,
      title: book.title ?? '',
      price: book.price ?? '',
      author: book.author ?? '',
      publisher: book.publisher ?? '',
      pages: book.pages ?? '',
      image: book.image ?? '',
      eta: book.eta ?? '',
      previewurl: book.previewurl ?? '',
      description: book.desc ?? book.description ?? '', 
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title || 'Tanpa Judul',
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
      };

      let response;
      if (isEditing && formData.id) {
        response = await supabase.from('books').update(payload).eq('id', formData.id);
      } else {
        const { id, ...payloadWithoutId } = payload as any;
        response = await supabase.from('books').insert([payloadWithoutId]);
      }
      if (response.error) throw new Error(response.error.message);

      setIsModalOpen(false);
      fetchBooks();
      setMsg({ type: 'success', text: 'Berhasil disimpan!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Hapus permanen?')) {
      await supabase.from('books').delete().eq('id', id);
      fetchBooks();
      setMsg({ type: 'success', text: 'Berhasil dihapus.' });
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8B5E3C] mb-4"></div>
        <p className="text-[#8B5E3C] font-black uppercase tracking-widest text-xs">Mengecek Akses Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-[#6D4C41] font-sans pb-20 overflow-x-hidden text-sm">
      
      {/* INPUT FILE TERSEMBUNYI UNTUK IMPORT */}
      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* --- NAVBAR --- */}
      <header className="bg-[#FFF9F0]/90 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/katalog" className="p-2 hover:bg-white rounded-full transition-all text-[#8B5E3C]">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-[#8B5E3C] tracking-tight">
              Akinara<span className="text-[#FF9E9E]">Admin</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            
            {/* BUTTON IMPORT */}
            <button 
              onClick={handleImportClick}
              title="Import CSV"
              className="p-2.5 bg-white border border-green-200 text-green-600 hover:bg-green-50 rounded-full transition-all shadow-sm"
            >
              <Upload className="w-5 h-5" />
            </button>

            {/* BUTTON EXPORT */}
            <button 
              onClick={handleExportCSV}
              title="Export CSV"
              className="p-2.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full transition-all shadow-sm"
            >
              <Download className="w-5 h-5" />
            </button>

            <button onClick={openAddModal} className="bg-[#FF9E9E] hover:bg-[#ff8585] text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-md active:scale-95">
              <Plus className="w-4 h-4" /> Tambah
            </button>
            <button onClick={handleLogout} className="p-2.5 bg-white border border-orange-100 text-[#8B5E3C] hover:text-red-500 rounded-full transition-all shadow-sm group relative" title="Logout">
              <LogOut className="w-5 h-5" />
              {/* Indikator Timer */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" title="Auto-logout aktif"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[96%] mx-auto py-8">
        
        {/* Notifikasi Message */}
        {msg.text && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm animate-fade-in ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {msg.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
            {msg.text}
          </div>
        )}

        {/* --- FILTER SECTION --- */}
        <Reveal>
          <section className="bg-white p-6 rounded-[2.5rem] border border-orange-100 shadow-sm mb-10">
            <div className="flex flex-col xl:flex-row gap-4 items-center">
              <div className="flex-1 w-full flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input 
                    type="text" placeholder="Cari buku" value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F8F9FA] border-none focus:ring-2 focus:ring-orange-100 outline-none text-[#6D4C41] font-bold transition-all"
                  />
                </div>
                <button 
                  onClick={handleResetFilter}
                  title="Reset Filter"
                  className="p-3.5 bg-orange-50 text-[#FF9E9E] hover:bg-[#FF9E9E] hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center border border-orange-100"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full xl:w-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3.5 rounded-2xl bg-[#F8F9FA] text-[#8B5E3C] font-bold outline-none border-none focus:ring-2 focus:ring-orange-50 text-xs cursor-pointer">
                  <option value="Semua">Status Stok</option>
                  <option value="READY">READY</option><option value="PO">PO</option><option value="REFERENSI">REFERENSI</option>
                </select>

                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-3.5 rounded-2xl bg-[#F8F9FA] text-[#8B5E3C] font-bold outline-none border-none focus:ring-2 focus:ring-orange-50 text-xs cursor-pointer">
                  <option value="Semua">Jenis Buku</option>
                  <option value="Impor">Impor</option><option value="Lokal">Lokal</option>
                </select>

                <select value={filterAge} onChange={(e) => setFilterAge(e.target.value)} className="px-4 py-3.5 rounded-2xl bg-[#F8F9FA] text-[#8B5E3C] font-bold outline-none border-none focus:ring-2 focus:ring-orange-50 text-xs cursor-pointer">
                  {uniqueAges.map(age => <option key={age} value={age}>{age === 'Semua' ? 'Usia' : age}</option>)}
                </select>

                <select value={filterPublisher} onChange={(e) => setFilterPublisher(e.target.value)} className="px-4 py-3.5 rounded-2xl bg-[#F8F9FA] text-[#8B5E3C] font-bold outline-none border-none focus:ring-2 focus:ring-orange-50 text-xs cursor-pointer">
                  {uniquePublishers.map(pub => <option key={pub} value={pub}>{pub === 'Semua' ? 'Penerbit' : pub}</option>)}
                </select>

                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3.5 rounded-2xl bg-[#F8F9FA] text-[#8B5E3C] font-bold outline-none border-none focus:ring-2 focus:ring-orange-50 text-xs cursor-pointer">
                  {uniqueTypes.map(t => <option key={t} value={t}>{t === 'Semua' ? 'Format' : t}</option>)}
                </select>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-3.5 rounded-2xl bg-[#F8F9FA] text-[#8B5E3C] font-bold outline-none border-none focus:ring-2 focus:ring-orange-50 text-xs cursor-pointer">
                  <option value="terbaru">Urutan: Terbaru</option><option value="terlama">Urutan: Terlama</option>
                  <option value="az">Urutan: A - Z</option><option value="za">Urutan: Z - A</option>
                </select>
              </div>
            </div>
          </section>
        </Reveal>

        {/* --- TABEL DATA --- */}
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
                <tr><td colSpan={5} className="text-center py-20 text-orange-200 font-bold uppercase animate-pulse">Loading...</td></tr>
              ) : filteredBooks.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 text-gray-400 font-bold">Data tidak ditemukan</td></tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-[#FFF9F0] transition-all group">
                    <td className="px-6 py-4 text-xs font-bold text-gray-300 text-center">#{book.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-5">
                        <img src={book.image} className="w-14 h-20 object-cover rounded-xl shadow-md bg-gray-100" />
                        <div className="space-y-2">
                          <div className="font-black text-gray-800 text-base leading-tight">{book.title}</div>
                          <div className="text-[10px] text-orange-400 font-black uppercase tracking-widest flex items-center gap-2">
                             <User className="w-3 h-3"/> {book.author || 'No Author'}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[9px]">
                            <span className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-md font-bold shadow-sm">
                              <Layers className="w-2.5 h-2.5"/> {book.category}
                            </span>
                            <span className="flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-1 rounded-md font-bold shadow-sm">
                              <Building2 className="w-2.5 h-2.5"/> {book.publisher || '-'}
                            </span>
                            <span className="flex items-center gap-1 bg-orange-50 text-[#8B5E3C] px-2 py-1 rounded-md border border-orange-200 font-bold shadow-sm">
                              <Baby className="w-2.5 h-2.5"/> {book.age}
                            </span>
                            <span className="flex items-center gap-1 bg-[#8B5E3C] text-white px-2 py-1 rounded-md font-bold shadow-sm">
                              <BookText className="w-2.5 h-2.5"/> {book.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-base font-black text-[#FF9E9E] text-center italic">Rp {Number(book.price).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-sm ${book.status === 'READY' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{book.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(book)} className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all"><Edit className="w-5 h-5"/></button>
                        <button onClick={() => book.id && handleDelete(book.id)} className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all"><Trash2 className="w-5 h-5"/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col scale-up">
            <div className="px-10 py-6 border-b border-orange-50 flex justify-between items-center bg-[#FFF9F0]/50">
              <h2 className="text-2xl font-black text-[#8B5E3C] tracking-tighter uppercase">{isEditing ? 'UPDATE KATALOG' : 'INPUT KATALOG BARU'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all"><X/></button>
            </div>
            <form onSubmit={handleSave} className="p-10 overflow-y-auto space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* ... (SEMUA INPUT FIELD TETAP SAMA) ... */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2"><Tag className="w-3 h-3"/> Judul Lengkap Buku *</label>
                    <input required type="text" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold text-lg" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2"><Hash className="w-3 h-3"/> Harga Jual (Rp) *</label>
                    <input required type="number" value={formData.price || ''} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold text-lg" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2"><BookOpenIcon className="w-3 h-3"/> Format / Material</label>
                    <select value={formData.type || 'Board Book'} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 font-bold text-gray-900 outline-none">
                      {formatOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2"><Clock className="w-3 h-3"/> Status Katalog</label>
                    <select value={formData.status || 'READY'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 font-bold text-gray-900 outline-none">
                      <option value="READY">READY STOCK</option><option value="PO">PRE-ORDER</option><option value="REFERENSI">REFERENSI</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2"><Filter className="w-3 h-3"/> Jenis / Asal</label>
                    <select value={formData.category || 'Impor'} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 font-bold text-gray-900 outline-none">
                      <option value="Impor">BUKU IMPOR</option><option value="Lokal">BUKU LOKAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2"><User className="w-3 h-3"/> Penulis / Kreator</label>
                    <input type="text" value={formData.author || ''} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2"><Building2 className="w-3 h-3"/> Penerbit / Publisher</label>
                    <input type="text" value={formData.publisher || ''} onChange={(e) => setFormData({...formData, publisher: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2"><Baby className="w-3 h-3"/> Rekomendasi Usia</label>
                    <input type="text" value={formData.age || ''} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold" placeholder="Misal: 3-5 Tahun" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2"><Youtube className="w-3 h-3"/> Preview URL (Video)</label>
                    <input type="text" value={formData.previewurl || ''} onChange={(e) => setFormData({...formData, previewurl: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold" placeholder="Link YouTube/Instagram" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar className="w-3 h-3"/> Estimasi Kedatangan (ETA)</label>
                    <input type="text" value={formData.eta || ''} onChange={(e) => setFormData({...formData, eta: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2"><ImageIcon className="w-3 h-3"/> Link Cover Gambar Utama *</label>
                    <input required type="text" value={formData.image || ''} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold" placeholder="https://..." />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-black text-[#8B5E3C] uppercase tracking-widest mb-2 flex items-center gap-2"><Globe className="w-3 h-3"/> Deskripsi Lengkap / Sinopsis</label>
                    <textarea rows={4} value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#FF9E9E] outline-none text-gray-900 font-bold leading-relaxed" />
                  </div>
               </div>
               <div className="flex gap-4 pt-6">
                <button type="submit" disabled={loading} className="flex-1 bg-[#8B5E3C] hover:bg-[#6D4C41] text-white py-5 rounded-2xl font-black text-lg shadow-xl disabled:bg-gray-200 transition-all active:scale-95">
                  {loading ? 'MENYIMPAN...' : 'SIMPAN KE DATABASE'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 bg-gray-100 text-gray-400 font-black rounded-2xl uppercase tracking-widest text-xs">Batal</button>
               </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}
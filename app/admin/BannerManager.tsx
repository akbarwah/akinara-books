'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Calendar, Link as LinkIcon, Truck,
  CheckCircle, Circle, Plus, Trash2,
  AlertCircle, Loader2, Edit3, X
} from 'lucide-react';

// ============================================================
// TIPE
// ============================================================
interface BannerConfig {
  id: number;
  publisher_name: string;
  target_date: string;
  eta_text: string;
  waitlist_link: string;
  is_active: boolean;
}

// ✅ Notifikasi inline — tidak pakai alert()
interface Notification {
  type: 'success' | 'error';
  text: string;
}

// ============================================================
// KOMPONEN
// ============================================================
export default function BannerManager() {
  const [banners, setBanners] = useState<BannerConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Konfirmasi delete inline — tidak pakai confirm()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Form state
  const [publisherName, setPublisherName] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [etaText, setEtaText] = useState('');
  const [waitlistLink, setWaitlistLink] = useState('');
  const [isEditing, setIsEditing] = useState<number | null>(null);

  // ✅ Auto-dismiss notification setelah 4 detik
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // ✅ useCallback agar fetchBanners stabil
  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('banner_config')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setNotification({ type: 'error', text: 'Gagal memuat data banner.' });
    } else {
      setBanners(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // ✅ Tambah/Edit banner
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      publisher_name: publisherName,
      target_date: targetDate,
      eta_text: etaText,
      waitlist_link: waitlistLink,
      is_active: isEditing ? undefined : false,
    };

    let error;
    if (isEditing) {
      const { error: updateError } = await supabase
        .from('banner_config')
        .update({
          publisher_name: publisherName,
          target_date: targetDate,
          eta_text: etaText,
          waitlist_link: waitlistLink,
        })
        .eq('id', isEditing);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('banner_config').insert([payload]);
      error = insertError;
    }

    if (error) {
      setNotification({ type: 'error', text: `Gagal: ${error.message}` });
    } else {
      setNotification({ type: 'success', text: isEditing ? 'Banner berhasil diupdate!' : 'Banner berhasil ditambahkan!' });
      resetForm();
      fetchBanners();
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setPublisherName('');
    setTargetDate('');
    setEtaText('');
    setWaitlistLink('');
    setIsEditing(null);
  };

  const startEdit = (banner: BannerConfig) => {
    setPublisherName(banner.publisher_name);
    // targetDate dari DB biasanya dalam format ISO, parse ke YYYY-MM-DDTHH:mm untuk input datetime-local
    const dt = new Date(banner.target_date);
    const tzOffset = dt.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(dt.getTime() - tzOffset)).toISOString().slice(0, 16);
    
    setTargetDate(localISOTime);
    setEtaText(banner.eta_text || '');
    setWaitlistLink(banner.waitlist_link || '');
    setIsEditing(banner.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Toggle aktif/nonaktif dengan loading per-item
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    setTogglingId(id);
    const { error } = await supabase
      .from('banner_config')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      setNotification({ type: 'error', text: `Gagal update status: ${error.message}` });
    } else {
      setNotification({
        type: 'success',
        text: !currentStatus ? 'Banner diaktifkan!' : 'Banner dinonaktifkan.',
      });
      fetchBanners();
    }
    setTogglingId(null);
  };

  // ✅ Delete dengan konfirmasi inline — tidak pakai confirm()
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('banner_config')
      .delete()
      .eq('id', id);

    if (error) {
      setNotification({ type: 'error', text: `Gagal hapus: ${error.message}` });
    } else {
      setNotification({ type: 'success', text: 'Banner berhasil dihapus.' });
      fetchBanners();
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 font-sans">
      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Manajemen Banner Pre-Order
      </h2>

      {/* ✅ Notifikasi inline */}
      {notification && (
        <div
          className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {notification.text}
        </div>
      )}

      {/* Form Tambah/Edit Banner */}
      <form
        onSubmit={handleSaveBanner}
        className={`${isEditing ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'} p-5 rounded-xl border mb-8 space-y-4 transition-colors`}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className={`text-sm font-semibold flex items-center gap-2 ${isEditing ? 'text-blue-600' : 'text-slate-600'}`}>
            {isEditing ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
            {isEditing ? 'Edit Jadwal PO' : 'Buat Jadwal PO Baru'}
          </h3>
          {isEditing && (
            <button type="button" onClick={resetForm} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
              <X className="w-3 h-3" /> Batal Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Nama Penerbit (Judul)
            </label>
            <input
              required
              type="text"
              value={publisherName}
              onChange={(e) => setPublisherName(e.target.value)}
              placeholder="e.g., Flying Eye Books"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Batas Waktu PO (Tutup)
            </label>
            <input
              required
              type="datetime-local"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Estimasi Kedatangan (ETA)
            </label>
            <input
              required
              type="text"
              value={etaText}
              onChange={(e) => setEtaText(e.target.value)}
              placeholder="e.g., Mei-Juni 2026"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Link Waitlist (WhatsApp URL)
            </label>
            <input
              type="url"
              value={waitlistLink}
              onChange={(e) => setWaitlistLink(e.target.value)}
              placeholder="https://wa.me/..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${isEditing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600'} text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2`}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Menyimpan...' : (isEditing ? 'Update Draft PO' : 'Simpan Draft PO')}
          </button>
        </div>
      </form>

      {/* Daftar Banner */}
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-3">
          Riwayat & Status Banner
        </h3>

        {isLoading ? (
          <div className="text-center py-4 text-sm text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Memuat data...
          </div>
        ) : (
          <div className="space-y-3">
            {banners.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed rounded-xl">
                Belum ada data PO.
              </div>
            ) : (
              banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border transition-all gap-3 ${
                    banner.is_active
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800">
                        {banner.publisher_name}
                      </h4>
                      {banner.is_active && (
                        <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold tracking-wider">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Tutup:{' '}
                        {new Date(banner.target_date).toLocaleDateString('id-ID')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" /> ETA: {banner.eta_text}
                      </span>
                      {banner.waitlist_link && (
                        <span className="flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" /> WA Link tersimpan
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    {/* Toggle aktif */}
                    <button
                      onClick={() =>
                        handleToggleActive(banner.id, banner.is_active)
                      }
                      disabled={togglingId === banner.id}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 ${
                        banner.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {togglingId === banner.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : banner.is_active ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                      {banner.is_active ? 'Aktif' : 'Jadikan Aktif'}
                    </button>

                    {/* ✅ Konfirmasi delete inline */}
                    {confirmDeleteId === banner.id ? (
                      <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                        <span className="text-xs text-red-600 font-bold">
                          Yakin?
                        </span>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          disabled={deletingId === banner.id}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded font-bold hover:bg-red-600 disabled:opacity-50"
                        >
                          {deletingId === banner.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'Hapus'
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-slate-500 hover:text-slate-700 font-bold"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(banner)}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          aria-label="Edit banner"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(banner.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Hapus banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
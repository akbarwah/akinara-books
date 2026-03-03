"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Sesuaikan dengan path file Anda
import { Calendar, Link as LinkIcon, Truck, CheckCircle, Circle, Plus, Trash2 } from 'lucide-react';

interface BannerConfig {
    id: number;
    publisher_name: string;
    target_date: string;
    eta_text: string;
    waitlist_link: string;
    is_active: boolean;
}

export default function BannerManager() {
    const [banners, setBanners] = useState<BannerConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [publisherName, setPublisherName] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [etaText, setEtaText] = useState('');
    const [waitlistLink, setWaitlistLink] = useState('');

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('banner_config')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching banners:', error);
        } else {
            setBanners(data || []);
        }
        setIsLoading(false);
    };

    const handleAddBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase
            .from('banner_config')
            .insert([
                {
                    publisher_name: publisherName,
                    target_date: targetDate,
                    eta_text: etaText,
                    waitlist_link: waitlistLink,
                    is_active: false // Default selalu false agar tidak kaget
                }
            ]);

        if (error) {
            alert('Gagal menambahkan banner: ' + error.message);
        } else {
            // Reset form
            setPublisherName('');
            setTargetDate('');
            setEtaText('');
            setWaitlistLink('');
            fetchBanners(); // Refresh list
        }
        setIsSubmitting(false);
    };

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        // Jika sudah aktif dan diklik lagi, kita asumsikan ingin mematikan banner sepenuhnya
        const newStatus = !currentStatus;

        const { error } = await supabase
            .from('banner_config')
            .update({ is_active: newStatus })
            .eq('id', id);

        if (error) {
            alert('Gagal mengupdate status: ' + error.message);
        } else {
            // Trigger PostgreSQL akan otomatis mematikan yang lain jika newStatus === true
            fetchBanners(); 
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus data PO ini?')) return;
        
        const { error } = await supabase
            .from('banner_config')
            .delete()
            .eq('id', id);
            
        if (!error) fetchBanners();
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 font-sans">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Manajemen Banner Pre-Order</h2>

            {/* Form Tambah Banner Baru */}
            <form onSubmit={handleAddBanner} className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-8 space-y-4">
                <h3 className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-3">
                    <Plus className="w-4 h-4" /> Buat Jadwal PO Baru
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Nama Penerbit (Judul)</label>
                        <input required type="text" value={publisherName} onChange={(e) => setPublisherName(e.target.value)} placeholder="e.g., Flying Eye Books" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Batas Waktu PO (Tutup)</label>
                        <input required type="datetime-local" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Estimasi Kedatangan (ETA)</label>
                        <input required type="text" value={etaText} onChange={(e) => setEtaText(e.target.value)} placeholder="e.g., Mei-Juni 2026" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Link Waitlist (WhatsApp URL)</label>
                        <input type="url" value={waitlistLink} onChange={(e) => setWaitlistLink(e.target.value)} placeholder="https://wa.me/..." className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none" />
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Draft PO'}
                    </button>
                </div>
            </form>

            {/* Daftar Banner */}
            <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-3">Riwayat & Status Banner</h3>
                {isLoading ? (
                    <div className="text-center py-4 text-sm text-slate-400">Memuat data...</div>
                ) : (
                    <div className="space-y-3">
                        {banners.map((banner) => (
                            <div key={banner.id} className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-xl border transition-all ${banner.is_active ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                <div className="flex-1 w-full mb-3 md:mb-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-800">{banner.publisher_name}</h4>
                                        {banner.is_active && <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold tracking-wider">LIVE</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Tutup: {new Date(banner.target_date).toLocaleDateString('id-ID')}</span>
                                        <span className="flex items-center gap-1"><Truck className="w-3 h-3"/> ETA: {banner.eta_text}</span>
                                        <span className="flex items-center gap-1 truncate max-w-[150px]"><LinkIcon className="w-3 h-3"/> WA Link tersimpan</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                    <button 
                                        onClick={() => handleToggleActive(banner.id, banner.is_active)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${banner.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        {banner.is_active ? <CheckCircle className="w-4 h-4"/> : <Circle className="w-4 h-4"/>}
                                        {banner.is_active ? 'Aktif' : 'Jadikan Aktif'}
                                    </button>
                                    <button onClick={() => handleDelete(banner.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {banners.length === 0 && <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed rounded-xl">Belum ada data PO.</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
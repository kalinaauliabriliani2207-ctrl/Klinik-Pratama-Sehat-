/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Check, 
  Clock, 
  FileText, 
  UserPlus, 
  Calendar,
  Sparkles,
  ClipboardList,
  AlertCircle,
  X,
  Stethoscope,
  ChevronDown,
  HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  KunjunganWithDetails, 
  Pasien, 
  JadwalWithDetails,
  Kunjungan,
  RekamMedis,
  Obat,
  Tindakan
} from '../types';

interface KunjunganManagerProps {
  kunjunganList: KunjunganWithDetails[];
  pasienList: Pasien[];
  jadwalList: JadwalWithDetails[];
  obatList: Obat[];
  tindakanList: Tindakan[];
  onAddKunjungan: (kunjungan: Omit<Kunjungan, 'id_kunjungan'>) => Promise<any>;
  onUpdateStatus: (id: string, status: 'menunggu' | 'selesai') => Promise<any>;
  onDeleteKunjungan: (id: string) => Promise<any>;
  onAddRekamMedis: (
    rekam: Omit<RekamMedis, 'id_rekam'>,
    selectedObats: { id_obat: string; jumlah: number; aturan_pakai: string }[],
    selectedTindakans: string[]
  ) => Promise<any>;
}

export default function KunjunganManager({
  kunjunganList,
  pasienList,
  jadwalList,
  obatList,
  tindakanList,
  onAddKunjungan,
  onUpdateStatus,
  onDeleteKunjungan,
  onAddRekamMedis
}: KunjunganManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'menunggu' | 'selesai'>('semua');
  
  // Registration Form States
  const [isRegFormOpen, setIsRegFormOpen] = useState(false);
  const [selectedPasienId, setSelectedPasienId] = useState('');
  const [selectedJadwalId, setSelectedJadwalId] = useState('');
  const [tanggalKunjungan, setTanggalKunjungan] = useState(new Date().toISOString().split('T')[0]);
  const [keluhan, setKeluhan] = useState('');

  // Medical Record Creation Form States (In-line Quick Action)
  const [activeKunjunganForRM, setActiveKunjunganForRM] = useState<KunjunganWithDetails | null>(null);
  const [diagnosa, setDiagnosa] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [resep, setResep] = useState('');

  // Relational sub table choices states
  const [selectedTindakanIds, setSelectedTindakanIds] = useState<string[]>([]);
  const [selectedObatItems, setSelectedObatItems] = useState<{ id_obat: string; nama_obat: string; jumlah: number; aturan_pakai: string }[]>([]);

  // Item additions inputs
  const [tempObatId, setTempObatId] = useState('');
  const [tempObatQty, setTempObatQty] = useState(1);
  const [tempObatAturan, setTempObatAturan] = useState('3x1 Tablet');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper sync summaries
  const syncTindakanText = (tIds: string[]) => {
    const names = tIds.map(id => tindakanList.find(t => t.id_tindakan === id)?.nama_tindakan).filter(Boolean);
    setTindakan(names.join(', '));
  };

  const syncResepText = (obats: { id_obat: string; nama_obat: string; jumlah: number; aturan_pakai: string }[]) => {
    const lines = obats.map(o => `${o.nama_obat} (#${o.jumlah} PCS) - Aturan: ${o.aturan_pakai}`);
    setResep(lines.join('; '));
  };

  // Submit Kunjungan Baru
  const handleRegisterKunjungan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPasienId || !selectedJadwalId || !tanggalKunjungan || !keluhan) {
      alert('Harap isi lengkap seluruh formulir pendaftaran!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddKunjungan({
        id_pasien: selectedPasienId,
        id_jadwal: selectedJadwalId,
        tanggal_kunjungan: tanggalKunjungan,
        keluhan,
        status: 'menunggu'
      });
      setSelectedPasienId('');
      setSelectedJadwalId('');
      setKeluhan('');
      setIsRegFormOpen(false);
    } catch (err) {
      alert('Gagal meregistrasi kunjungan berobat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Rekam Medis Baru
  const handleSaveRekamMedis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKunjunganForRM || !diagnosa || !tindakan || !resep) {
      alert('Harap lengkapi diagnosa, tindakan, dan resep obat!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddRekamMedis(
        {
          id_kunjungan: activeKunjunganForRM.id_kunjungan,
          diagnosa,
          tindakan,
          resep
        },
        selectedObatItems.map(o => ({ id_obat: o.id_obat, jumlah: o.jumlah, aturan_pakai: o.aturan_pakai })),
        selectedTindakanIds
      );
      setDiagnosa('');
      setTindakan('');
      setResep('');
      setSelectedTindakanIds([]);
      setSelectedObatItems([]);
      setTempObatId('');
      setTempObatQty(1);
      setTempObatAturan('3x1 Tablet');
      setActiveKunjunganForRM(null);
    } catch (err) {
      console.error(err);
      alert('Gagal merekam rekam medis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter List
  const filteredKunjungan = kunjunganList.filter((k) => {
    const nameMatch = k.pasien?.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      k.jadwal?.dokter?.nama_dokter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      k.keluhan.toLowerCase().includes(searchQuery.toLowerCase());

    const statusMatch = statusFilter === 'semua' || k.status === statusFilter;

    return nameMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Registrasi Kunjungan Pasien</h1>
          <p className="text-xs text-slate-500">Daftarkan loket kunjungan berobat jalan serta verifikasi status antrean dokter</p>
        </div>

        <button
          id="btn-tambah-kunjungan"
          onClick={() => {
            if (pasienList.length === 0) {
              alert('Harap registrasikan pasien terlebih dahulu di tab Pasien!');
              return;
            }
            if (jadwalList.length === 0) {
              alert('Harap buat jadwal tugas dokter terlebih dahulu di divisi Tenaga Medis!');
              return;
            }
            setSelectedPasienId(pasienList[0].id_pasien);
            setSelectedJadwalId(jadwalList[0].id_jadwal);
            setIsRegFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:scale-[1.01]"
        >
          <UserPlus className="h-4.5 w-4.5" />
          Daftarkan Pasien Berobat
        </button>
      </div>

      {/* Searching / Filters Utility */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            id="input-cari-kunjungan"
            type="text"
            placeholder="Cari berdasarkan nama pasien, nama dokter, atau diagnosa keluhan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status selection pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 shrink-0">
          {(['semua', 'menunggu', 'selesai'] as const).map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => setStatusFilter(statusOption)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === statusOption 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {statusOption === 'semua' ? 'Semua' : (statusOption === 'menunggu' ? '🕒 Menunggu' : '✅ Selesai')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visitation Queue List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredKunjungan.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Tidak ada antrean kunjungan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Belum ada data kunjungan berobat untuk rentang filter saat ini. Daftarkan di tombol registrasi di atas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredKunjungan.map((kunjungan) => (
              <div 
                key={kunjungan.id_kunjungan}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-slate-50/50 transition"
              >
                {/* Left col: Patient & consultation info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 font-bold border ${
                    kunjungan.status === 'menunggu'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-blue-50 text-blue-600 border-blue-200'
                  }`}>
                    {kunjungan.pasien?.nama?.charAt(0) || 'P'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-sm">{kunjungan.pasien?.nama}</h3>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                        ID Kunjungan: {kunjungan.id_kunjungan.substring(0, 5)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                      <span className="font-semibold text-blue-700">
                        👨‍⚕️ {kunjungan.jadwal?.dokter?.nama_dokter || 'Dokter tidak ditentukan'}
                      </span>
                      <span>•</span>
                      <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        🏥 {kunjungan.jadwal?.poli?.nama_poli || 'Poli Umum'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium">
                        🕒 Shift {kunjungan.jadwal?.hari} ({kunjungan.jadwal?.jam_mulai} - {kunjungan.jadwal?.jam_selesai})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/40 leading-relaxed italic">
                      <strong className="text-slate-700 font-semibold not-italic">Gejala / Keluhan:</strong> "{kunjungan.keluhan}"
                    </p>

                    {/* Show already attached health ledger chart */}
                    {kunjungan.rekamMedis && (
                      <div className="mt-2.5 p-3 bg-blue-50/35 rounded-xl border border-blue-100/50 space-y-1 text-xs">
                        <span className="font-bold text-blue-800 flex items-center gap-1">
                          🩺 Rekam Medis (RM-{kunjungan.rekamMedis.id_rekam.substring(0,5)})
                        </span>
                        <div className="text-slate-700">
                          <strong>Diagnosa:</strong> {kunjungan.rekamMedis.diagnosa}
                        </div>
                        <div className="text-slate-600">
                          <strong>Tindakan:</strong> {kunjungan.rekamMedis.tindakan}
                        </div>
                        <div className="text-slate-600 font-mono text-[11px] bg-white px-2 py-1 rounded inline-block mt-1 border border-blue-100/30">
                          💊 <strong>Resep:</strong> {kunjungan.rekamMedis.resep}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right col: Visited date, Status Badge, Aksi buttons */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 border-t md:border-0 pt-3 md:pt-0">
                  <div className="text-right space-y-1 self-start md:self-auto">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(kunjungan.tanggal_kunjungan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-1 border ${
                      kunjungan.status === 'menunggu' 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {kunjungan.status === 'menunggu' ? '🕒 Menunggu' : '✅ Selesai'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Process Medical details button if waiting */}
                    {kunjungan.status === 'menunggu' && (
                      <button
                        onClick={() => {
                          setDiagnosa('');
                          setTindakan('');
                          setResep('');
                          setActiveKunjunganForRM(kunjungan);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-800 transition"
                        title="Catat Rekam Medis"
                      >
                        <Stethoscope className="h-3.5 w-3.5" />
                        Catat Rekam Medis
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('Hapus registrasi kunjungan ini? Jika terdaftar dengan rekam medis, rekam medis terkait juga terhapus.')) {
                          onDeleteKunjungan(kunjungan.id_kunjungan);
                        }
                      }}
                      className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                      title="Hapus Kunjungan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REGISTRATION FORM MODAL */}
      <AnimatePresence>
        {isRegFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegFormOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/40">
                <h3 className="font-bold text-blue-900 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  Registrasi Kunjungan Pasien
                </h3>
                <button onClick={() => setIsRegFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleRegisterKunjungan} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Pilih Pasien Berobat</label>
                  <select
                    required
                    value={selectedPasienId}
                    onChange={(e) => setSelectedPasienId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="" disabled>--- Pilih Pasien ---</option>
                    {pasienList.map(p => (
                      <option key={p.id_pasien} value={p.id_pasien}>
                        {p.nama} ({p.no_hp})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Pilih Poliklinik & Jadwal Dokter</label>
                  <select
                    required
                    value={selectedJadwalId}
                    onChange={(e) => setSelectedJadwalId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="" disabled>--- Pilih Poli / Jadwal ---</option>
                    {jadwalList.map(j => (
                      <option key={j.id_jadwal} value={j.id_jadwal}>
                        {j.poli?.nama_poli} - {j.dokter?.nama_dokter} ({j.hari}: {j.jam_mulai} - {j.jam_selesai})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Tanggal Rencana Berobat</label>
                  <input
                    type="date"
                    required
                    value={tanggalKunjungan}
                    onChange={(e) => setTanggalKunjungan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Keluhan yang Dirasakan</label>
                  <textarea
                    required
                    rows={3}
                    value={keluhan}
                    onChange={(e) => setKeluhan(e.target.value)}
                    placeholder="Contoh: Mengalami pusing kepala sebelah kanan dan demam dingin sejak kemarin malam."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRegFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-800 font-semibold rounded-xl text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                  >
                    {isSubmitting ? 'Mendaftarkan...' : 'Konfirmasi Pendaftaran'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* CLINICAL CHART WRITE MODAL (REKAM MEDIS) */}
        {activeKunjunganForRM && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveKunjunganForRM(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 my-8"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Pencatatan Rekam Medis (E-MR)</h3>
                  <p className="text-[11px] text-blue-100">Pasien: {activeKunjunganForRM.pasien?.nama} ({activeKunjunganForRM.pasien?.jenis_kelamin})</p>
                </div>
                <button type="button" onClick={() => setActiveKunjunganForRM(null)} className="text-blue-100 hover:text-white">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleSaveRekamMedis} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="p-3 bg-blue-50/50 border border-blue-100/40 rounded-xl space-y-1.5 text-xs text-blue-900">
                  <div className="flex justify-between font-bold">
                    <span>Keluhan Utama Sesuai Registrasi</span>
                    <span>🕒 {activeKunjunganForRM.jadwal?.hari}</span>
                  </div>
                  <p className="italic text-slate-600">"{activeKunjunganForRM.keluhan}"</p>
                </div>

                {/* DIAGNOSA */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Diagnosis Dokter (Analisa Kritis) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gastritis Akut, Pulpitis Irreversibil, ISPA"
                    value={diagnosa}
                    onChange={(e) => setDiagnosa(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* TINDAKAN MEDIS (RELASIONAL TABLE: tindakan_pasien) */}
                <div className="space-y-2 border border-slate-150 p-4 rounded-xl bg-slate-50/30">
                  <label className="text-xs font-bold text-slate-800 block flex items-center gap-1">
                     <HeartPulse className="h-4 w-4 text-blue-600" /> Hubungkan Tindakan Medis (Intervensi Relasional)
                  </label>
                  
                  {tindakanList.length === 0 ? (
                    <p className="text-[11px] text-slate-400">Tidak ada item tindakan di divisi tindakan. Tulis manual di bawah.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1 bg-white border border-slate-200 rounded-lg">
                      {tindakanList.map((t) => {
                        const isChecked = selectedTindakanIds.includes(t.id_tindakan);
                        return (
                          <label 
                                       className={`flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 cursor-pointer text-xs transition border ${
                              isChecked ? 'border-blue-200 bg-blue-50/20' : 'border-transparent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let updated: string[];
                                if (e.target.checked) {
                                  updated = [...selectedTindakanIds, t.id_tindakan];
                                } else {
                                  updated = selectedTindakanIds.filter(id => id !== t.id_tindakan);
                                }
                                setSelectedTindakanIds(updated);
                                syncTindakanText(updated);
                              }}
                              className="accent-blue-600"
                            />
                            <div className="leading-tight">
                              <span className="font-semibold block text-slate-700">{t.nama_tindakan}</span>
                              <span className="text-[10px] text-blue-600">Tarif: Rp {t.tarif.toLocaleString('id-ID')}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Plain Text Summary Fallback */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-450 block">Deskripsi Summary Tindakan (Tersinkronisasi)</span>
                    <textarea
                      required
                      rows={2}
                      value={tindakan}
                      onChange={(e) => setTindakan(e.target.value)}
                      placeholder="Detail summary tindakan medis..."
                      className="w-full px-3 py-2 bg-white border border-slate-205 rounded-xl text-xs focus:outline-none focus:border-blue-500 resize-none font-sans"
                    />
                  </div>
                </div>

                {/* RESEP OBAT-OBATAN (RELASIONAL TABLE: resep_obat) */}
                <div className="space-y-2 border border-slate-150 p-4 rounded-xl bg-slate-50/30">
                  <label className="text-xs font-bold text-slate-800 block flex items-center gap-1">
                     <Clock className="h-4 w-4 text-emerald-600" /> Racik Resep Obat Pasien (Apotek Relasional)
                  </label>

                  {/* Form input additive */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white border border-slate-155 p-3 rounded-lg">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 block">Pilih Obat-obatan</span>
                      <select
                        value={tempObatId}
                        onChange={(e) => setTempObatId(e.target.value)}
                        className="w-full text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer focus:outline-none"
                      >
                        <option value="">-- Pilih Obat --</option>
                        {obatList.map(o => (
                          <option key={o.id_obat} value={o.id_obat} disabled={o.stok <= 0}>
                            {o.nama_obat} (Stok: {o.stok})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 block">Jumlah Qty</span>
                      <input
                        type="number"
                        min={1}
                        value={tempObatQty}
                        onChange={(e) => setTempObatQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 block">Aturan Pemakaian (Rx)</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={tempObatAturan}
                          onChange={(e) => setTempObatAturan(e.target.value)}
                          placeholder="3x1 Tablet"
                          className="w-full text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!tempObatId) {
                              alert('Pilih obat terlebih dahulu!');
                              return;
                            }
                            const matched = obatList.find(o => o.id_obat === tempObatId);
                            if (!matched) return;
                            
                            if (tempObatQty > matched.stok) {
                              alert(`Stok tidak mencukupi! Sisa stok obat ${matched.nama_obat} adalah ${matched.stok}.`);
                              return;
                            }

                            // Add to list
                            const updated = [
                              ...selectedObatItems,
                              {
                                id_obat: tempObatId,
                                nama_obat: matched.nama_obat,
                                jumlah: tempObatQty,
                                aturan_pakai: tempObatAturan
                              }
                            ];
                            setSelectedObatItems(updated);
                            syncResepText(updated);
                            setTempObatId('');
                            setTempObatQty(1);
                          }}
                          className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center shadow-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* List of chosen drugs */}
                  {selectedObatItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg border border-slate-200">
                      {selectedObatItems.map((o, idx) => (
                        <div 
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-emerald-100"
                        >
                          <span>{o.nama_obat}</span>
                          <span className="bg-emerald-600 text-white font-mono px-1 py-0.2 rounded text-[9px]">x{o.jumlah}</span>
                          <span className="italic text-slate-500">({o.aturan_pakai})</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = selectedObatItems.filter((_, i) => i !== idx);
                              setSelectedObatItems(updated);
                              syncResepText(updated);
                            }}
                            className="p-0.5 hover:bg-emerald-100 text-emerald-600 rounded transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resep Summary Text Area Fallback */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-450 block">Resep Obat-obatan Summary (Tersinkronisasi)</span>
                    <textarea
                      required
                      rows={2}
                      value={resep}
                      onChange={(e) => setResep(e.target.value)}
                      placeholder="Rx - Resep obat..."
                      className="w-full px-3 py-2 bg-white border border-slate-205 rounded-xl text-xs focus:outline-none focus:border-blue-500 resize-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveKunjunganForRM(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-800 font-semibold rounded-xl text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Rekam Medis'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

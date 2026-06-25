/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  UserPlus, 
  Phone, 
  MapPin, 
  Calendar,
  X,
  User,
  HeartPulse,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Pasien } from '../types';

interface PasienManagerProps {
  pasienList: Pasien[];
  onAddPasien: (pasien: Omit<Pasien, 'id_pasien'>) => Promise<any>;
  onUpdatePasien: (id: string, updated: Partial<Pasien>) => Promise<any>;
  onDeletePasien: (id: string) => Promise<any>;
}

export default function PasienManager({
  pasienList,
  onAddPasien,
  onUpdatePasien,
  onDeletePasien
}: PasienManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selGenderFilter, setSelGenderFilter] = useState<'Semua' | 'Laki-laki' | 'Perempuan'>('Semua');
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPasien, setEditingPasien] = useState<Pasien | null>(null);
  
  // Inputs
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [tglLahir, setTglLahir] = useState('');
  const [alamat, setAlamat] = useState('');
  const [noHp, setNoHp] = useState('');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper: hitung umur
  const calculateAge = (birthdate: string) => {
    if (!birthdate) return '0 Tahun';
    try {
      const today = new Date();
      const birthDate = new Date(birthdate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return `${age} Tahun`;
    } catch (e) {
      return '?? Tahun';
    }
  };

  const handleOpenAddForm = () => {
    setEditingPasien(null);
    setNama('');
    setJenisKelamin('Laki-laki');
    setTglLahir('');
    setAlamat('');
    setNoHp('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (pasien: Pasien) => {
    setEditingPasien(pasien);
    setNama(pasien.nama);
    setJenisKelamin(pasien.jenis_kelamin);
    setTglLahir(pasien.tgl_lahir);
    setAlamat(pasien.alamat);
    setNoHp(pasien.no_hp);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !tglLahir || !alamat || !noHp) {
      alert('Mohon lengkapi seluruh formulir data pasien!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPasien) {
        await onUpdatePasien(editingPasien.id_pasien, {
          nama,
          jenis_kelamin: jenisKelamin,
          tgl_lahir: tglLahir,
          alamat,
          no_hp: noHp
        });
      } else {
        await onAddPasien({
          nama,
          jenis_kelamin: jenisKelamin,
          tgl_lahir: tglLahir,
          alamat,
          no_hp: noHp
        });
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter lists
  const filteredPasien = pasienList.filter(pasien => {
    const matchesSearch = 
      pasien.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pasien.no_hp.includes(searchQuery) ||
      pasien.alamat.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGender = 
      selGenderFilter === 'Semua' || 
      pasien.jenis_kelamin === selGenderFilter;

    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar with actions */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Master Data Pasien</h1>
          <p className="text-xs text-slate-500">Kelola dan registrasikan rekam catatan identitas diri seluruh pasien</p>
        </div>

        <button
          id="btn-tambah-pasien"
          onClick={handleOpenAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99]"
        >
          <UserPlus className="h-4.5 w-4.5" />
          Registrasi Pasien Baru
        </button>
      </div>

      {/* Filter and search utilities */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            id="input-cari-pasien"
            type="text"
            placeholder="Cari pasien berdasarkan nama, alamat, atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Gender Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200/40">
          {(['Semua', 'Laki-laki', 'Perempuan'] as const).map((genderOption) => (
            <button
              key={genderOption}
              onClick={() => setSelGenderFilter(genderOption)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                selGenderFilter === genderOption 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {genderOption}
            </button>
          ))}
        </div>
      </div>

      {/* Patients List Grid/Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredPasien.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mb-3 border border-slate-100">
              <User className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Tidak ada data pasien</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Tidak ditemukan kecocokan untuk penelusuran kata kunci "{searchQuery}". Daftarkan pasien baru jika belum terdata.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Identitas Pasien</th>
                  <th className="py-3.5 px-6">Jenis Kelamin / Lahir</th>
                  <th className="py-3.5 px-6">Kontak WhatsApp</th>
                  <th className="py-3.5 px-6">Alamat Domisili</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPasien.map((pasien) => (
                  <tr key={pasien.id_pasien} className="hover:bg-slate-50/40 transition">
                    {/* Identitas */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {pasien.nama.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{pasien.nama}</h4>
                          <span className="text-[11px] text-slate-400">ID: {pasien.id_pasien.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    {/* Gender & Lahir */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          pasien.jenis_kelamin === 'Laki-laki' 
                            ? 'bg-sky-50 text-sky-700 border border-sky-100' 
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {pasien.jenis_kelamin}
                        </span>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{new Date(pasien.tgl_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="text-slate-400">({calculateAge(pasien.tgl_lahir)})</span>
                        </div>
                      </div>
                    </td>

                    {/* Kontak */}
                    <td className="py-4 px-6">
                      <a 
                        href={`https://wa.me/${pasien.no_hp}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-medium text-xs bg-slate-50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-slate-200/50 transition"
                      >
                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                        {pasien.no_hp}
                      </a>
                    </td>

                    {/* Alamat */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{pasien.alamat}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditForm(pasien)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition"
                          title="Ubah Data Pasien"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus pasien "${pasien.nama}"? Seluruh data riwayat kunjungan dan rekam medis juga akan dihapus.`)) {
                              onDeletePasien(pasien.id_pasien);
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition"
                          title="Hapus Pasien"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Add/Edit Panel Container using Framer Motion */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/40">
                <h3 className="font-bold text-blue-900 flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-blue-600" />
                  {editingPasien ? 'Ubah Data Pasien' : 'Registrasi Pasien Baru'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Nama Lengkap */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Nama Lengkap Pasien</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Muhammad Budi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Jenis Kelamin */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Jenis Kelamin</label>
                    <select
                      value={jenisKelamin}
                      onChange={(e) => setJenisKelamin(e.target.value as 'Laki-laki' | 'Perempuan')}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Tanggal Lahir</label>
                    <input
                      type="date"
                      required
                      value={tglLahir}
                      onChange={(e) => setTglLahir(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Nomor WhatsApp */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">No. HP (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Alamat Rumah */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Alamat Tinggal Sesuai KTP</label>
                  <textarea
                    required
                    rows={3}
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Tulis alamat rumah lengkap, kecamatan/desa..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-800 font-semibold rounded-xl text-xs transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : (editingPasien ? 'Simpan Perubahan' : 'Registrasikan Pasien')}
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

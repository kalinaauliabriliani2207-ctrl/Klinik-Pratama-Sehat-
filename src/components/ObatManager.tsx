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
  Pill, 
  DollarSign, 
  Layers, 
  X,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Obat } from '../types';

interface ObatManagerProps {
  obatList: Obat[];
  onAddObat: (obat: Omit<Obat, 'id_obat'>) => Promise<any>;
  onUpdateObat: (id: string, updated: Partial<Obat>) => Promise<any>;
  onDeleteObat: (id: string) => Promise<any>;
}

export default function ObatManager({
  obatList,
  onAddObat,
  onUpdateObat,
  onDeleteObat
}: ObatManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'semua' | 'aman' | 'hampir_habis'>('semua');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingObat, setEditingObat] = useState<Obat | null>(null);

  // Inputs
  const [namaObat, setNamaObat] = useState('');
  const [harga, setHarga] = useState<number>(0);
  const [stok, setStok] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAddForm = () => {
    setEditingObat(null);
    setNamaObat('');
    setHarga(0);
    setStok(0);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (obat: Obat) => {
    setEditingObat(obat);
    setNamaObat(obat.nama_obat);
    setHarga(obat.harga);
    setStok(obat.stok);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaObat || harga < 0 || stok < 0) {
      alert('Mohon isi formulir dengan benar!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingObat) {
        await onUpdateObat(editingObat.id_obat, {
          nama_obat: namaObat,
          harga: Number(harga),
          stok: Number(stok)
        });
      } else {
        await onAddObat({
          nama_obat: namaObat,
          harga: Number(harga),
          stok: Number(stok)
        });
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan data obat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter 
  const filteredObat = obatList.filter(o => {
    const matchesSearch = o.nama_obat.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (stockFilter === 'hampir_habis') {
      return matchesSearch && o.stok <= 15;
    } else if (stockFilter === 'aman') {
      return matchesSearch && o.stok > 15;
    }
    return matchesSearch;
  });

  // Helper format Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Obat & Alkes</h1>
          <p className="text-xs text-slate-500">Kelola persediaan obat-obatan klinik, harga dasar resep, dan kontrol stok kritis</p>
        </div>

        <button
          id="btn-tambah-obat"
          onClick={handleOpenAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="h-4.5 w-4.5" />
          Tambah Item Obat
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            id="input-cari-obat"
            type="text"
            placeholder="Cari obat berdasarkan nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200/40">
          {(['semua', 'aman', 'hampir_habis'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStockFilter(filter)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                stockFilter === filter 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {filter === 'semua' && 'Semua Persediaan'}
              {filter === 'aman' && 'Stok Aman (>15)'}
              {filter === 'hampir_habis' && 'Hampir Habis (≤15)'}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Low Alerts Block */}
      {obatList.filter(o => o.stok <= 10).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 text-xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">Peringatan: Stok Obat Kritis!</strong>
            Terdapat {obatList.filter(o => o.stok <= 10).length} jenis obat yang bersisa kurang dari 10 unit. Harap koordinasikan dengan bagian farmasi untuk melakukan restocking segera.
          </div>
        </div>
      )}

      {/* Table List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredObat.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mb-3 border border-slate-100">
              <Pill className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Tidak ada persediaan obat</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Tidak ditemukan item obat dengan kata kunci "{searchQuery}" atau filter stok yang dipilih.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Informasi Obat</th>
                  <th className="py-3.5 px-6">Harga Eceran (HET)</th>
                  <th className="py-3.5 px-6">Sisa Stok</th>
                  <th className="py-3.5 px-6">Status Gudang</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredObat.map((obat) => {
                  const isLow = obat.stok <= 15;
                  const isCritical = obat.stok <= 5;
                  return (
                    <tr key={obat.id_obat} className="hover:bg-slate-50/40 transition">
                      <td className="py-4 px-6 font-medium text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            isLow ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            <Pill className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">{obat.nama_obat}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">CODE: {obat.id_obat.substring(0,8)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-700">
                        {formatRupiah(obat.harga)}
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-slate-700">
                        {obat.stok} <span className="text-[10px] font-sans font-medium text-slate-400">PCS</span>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          isCritical 
                            ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' 
                            : isLow 
                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {isCritical ? 'CRITICAL - REFILL' : isLow ? 'Stok Tipis' : 'Stok Tersedia'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditForm(obat)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition"
                            title="Ubah Stok/Harga"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus obat "${obat.nama_obat}"?`)) {
                                onDeleteObat(obat.id_obat);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition"
                            title="Hapus Obat"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/40">
                <h3 className="font-bold text-blue-900 flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-blue-600" />
                  {editingObat ? 'Ubah Informasi Obat' : 'Tambah Obat Baru'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Nama Obat & Satuan</label>
                  <input
                    type="text"
                    required
                    value={namaObat}
                    onChange={(e) => setNamaObat(e.target.value)}
                    placeholder="Contoh: Paracetamol 500mg (Tablet)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-slate-400" /> Harga Eceran Tertinggi (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={harga}
                    onChange={(e) => setHarga(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="Contoh: 15000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block flex items-center gap-1">
                    <Layers className="h-3 w-3 text-slate-400" /> Jumlah Stok Gudang (PCS)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stok}
                    onChange={(e) => setStok(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="Contoh: 100"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

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
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Obat'}
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

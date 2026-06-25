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
  X,
  HeartPulse,
  Award,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tindakan } from '../types';

interface TindakanManagerProps {
  tindakanList: Tindakan[];
  onAddTindakan: (tindakan: Omit<Tindakan, 'id_tindakan'>) => Promise<any>;
  onUpdateTindakan: (id: string, updated: Partial<Tindakan>) => Promise<any>;
  onDeleteTindakan: (id: string) => Promise<any>;
}

export default function TindakanManager({
  tindakanList,
  onAddTindakan,
  onUpdateTindakan,
  onDeleteTindakan
}: TindakanManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTindakan, setEditingTindakan] = useState<Tindakan | null>(null);

  // Inputs
  const [namaTindakan, setNamaTindakan] = useState('');
  const [tarif, setTarif] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAddForm = () => {
    setEditingTindakan(null);
    setNamaTindakan('');
    setTarif(0);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (tindakan: Tindakan) => {
    setEditingTindakan(tindakan);
    setNamaTindakan(tindakan.nama_tindakan);
    setTarif(tindakan.tarif);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaTindakan || tarif < 0) {
      alert('Mohon isi formulir tindakan medis secara lengkap!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTindakan) {
        await onUpdateTindakan(editingTindakan.id_tindakan, {
          nama_tindakan: namaTindakan,
          tarif: Number(tarif)
        });
      } else {
        await onAddTindakan({
          nama_tindakan: namaTindakan,
          tarif: Number(tarif)
        });
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal mendata tindakan medis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTindakan = tindakanList.filter(t => 
    t.nama_tindakan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Tindakan Medis</h1>
          <p className="text-xs text-slate-500">Kelola daftar tindakan perawatan, tindakan operatif, scaling gigi, pemeriksaan laboratorium, dan penentuan tarif tindakan</p>
        </div>

        <button
          id="btn-tambah-tindakan"
          onClick={handleOpenAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="h-4.5 w-4.5" />
          Tambah Tindakan Medis
        </button>
      </div>

      {/* Utilities */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
        <input
          id="input-cari-tindakan"
          type="text"
          placeholder="Cari tindakan medis berdasarkan nama..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Table list */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredTindakan.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mb-3 border border-slate-100">
              <Stethoscope className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">Tidak ada tindakan medis terdaftar</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Tidak ditemukan tindakan perawatan klinik dengan kata kunci "{searchQuery}". Daftarkan tindakan medis baru jika diperlukan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Layanan / Tindakan Medis</th>
                  <th className="py-3.5 px-6">Tarif Resmi Pasien</th>
                  <th className="py-3.5 px-6">ID Sistem</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTindakan.map((tindakan) => (
                  <tr key={tindakan.id_tindakan} className="hover:bg-slate-50/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                          <Award className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{tindakan.nama_tindakan}</h4>
                          <span className="text-[10px] text-slate-400">Kategori: Tindakan Jalan</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-blue-700">
                      {formatRupiah(tindakan.tarif)}
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-slate-400">
                      {tindakan.id_tindakan}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditForm(tindakan)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition"
                          title="Ubah Tarif Tindakan"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus tindakan medis "${tindakan.nama_tindakan}"?`)) {
                              onDeleteTindakan(tindakan.id_tindakan);
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition"
                          title="Hapus Tindakan"
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
                  {editingTindakan ? 'Ubah Tarif Perawatan' : 'Tambah Tindakan Medis Terdaftar'}
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
                  <label className="text-xs font-bold text-slate-600 block">Nama Tindakan Medis</label>
                  <input
                    type="text"
                    required
                    value={namaTindakan}
                    onChange={(e) => setNamaTindakan(e.target.value)}
                    placeholder="Contoh: Scaling Gigi Berat"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Tarif Tindakan Pasien (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={tarif}
                    onChange={(e) => setTarif(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="Contoh: 150000"
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
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Tindakan'}
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

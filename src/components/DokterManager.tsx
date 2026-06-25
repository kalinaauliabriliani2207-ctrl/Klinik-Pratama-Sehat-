/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Stethoscope, 
  Building, 
  CalendarDays, 
  Clock, 
  Phone,
  User,
  Heart,
  X,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dokter, Poli, JadwalWithDetails, JadwalDokter } from '../types';

interface DokterManagerProps {
  dokterList: Dokter[];
  poliList: Poli[];
  jadwalList: JadwalWithDetails[];
  onAddDokter: (dokter: Omit<Dokter, 'id_dokter'>) => Promise<void>;
  onDeleteDokter: (id: string) => Promise<void>;
  onAddPoli: (poli: Omit<Poli, 'id_poli'>) => Promise<void>;
  onDeletePoli: (id: string) => Promise<void>;
  onAddJadwal: (jadwal: Omit<JadwalDokter, 'id_jadwal'>) => Promise<void>;
  onDeleteJadwal: (id: string) => Promise<void>;
}

export default function DokterManager({
  dokterList,
  poliList,
  jadwalList,
  onAddDokter,
  onDeleteDokter,
  onAddPoli,
  onDeletePoli,
  onAddJadwal,
  onDeleteJadwal
}: DokterManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'dokter' | 'poli' | 'jadwal'>('dokter');

  // Input states for Dokter
  const [namaDokter, setNamaDokter] = useState('');
  const [spesialis, setSpesialis] = useState('');
  const [noHpDokter, setNoHpDokter] = useState('');
  const [isDokterFormOpen, setIsDokterFormOpen] = useState(false);

  // Input states for Poli
  const [namaPoli, setNamaPoli] = useState('');
  const [isPoliFormOpen, setIsPoliFormOpen] = useState(false);

  // Input states for Jadwal
  const [selectedDokterId, setSelectedDokterId] = useState('');
  const [selectedPoliId, setSelectedPoliId] = useState('');
  const [hari, setHari] = useState('Senin');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('12:00');
  const [isJadwalFormOpen, setIsJadwalFormOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // Submit Dokter
  const handleSubmitDokter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaDokter || !spesialis || !noHpDokter) {
      alert('Mohon lengkapi seluruh kolom data dokter!');
      return;
    }
    setIsSaving(true);
    try {
      await onAddDokter({
        nama_dokter: namaDokter,
        spesialis,
        no_hp: noHpDokter
      });
      setNamaDokter('');
      setSpesialis('');
      setNoHpDokter('');
      setIsDokterFormOpen(false);
    } catch (err) {
      alert('Gagal menambahkan data dokter.');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Poli
  const handleSubmitPoli = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPoli) {
      alert('Mohon masukkan nama poli klinik!');
      return;
    }
    setIsSaving(true);
    try {
      await onAddPoli({ nama_poli: namaPoli });
      setNamaPoli('');
      setIsPoliFormOpen(false);
    } catch (err) {
      alert('Poli sudah terdaftar atau terjadi gangguan sistem.');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Jadwal
  const handleSubmitJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDokterId || !selectedPoliId || !hari || !jamMulai || !jamSelesai) {
      alert('Mohon isi semua data jadwal praktik!');
      return;
    }
    setIsSaving(true);
    try {
      await onAddJadwal({
        id_dokter: selectedDokterId,
        id_poli: selectedPoliId,
        hari,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai
      });
      setSelectedDokterId('');
      setSelectedPoliId('');
      setHari('Senin');
      setJamMulai('08:00');
      setJamSelesai('12:00');
      setIsJadwalFormOpen(false);
    } catch (err) {
      alert('Gagal menjadwalkan dokter.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Tenaga Medis & Jadwal</h1>
          <p className="text-xs text-slate-500">
            Daftarkan dokter, buat klinik poli baru, serta atur pembagian jadwal penugasan dokter
          </p>
        </div>

        {/* Sub-tab selection anchors */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 self-start md:self-center">
          <button
            onClick={() => setActiveSubTab('dokter')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'dokter' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Dokter ({dokterList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('poli')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'poli' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Building className="h-3.5 w-3.5" />
            Poli Departemen ({poliList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('jadwal')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'jadwal' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Jadwal Dokter ({jadwalList.length})
          </button>
        </div>
      </div>

      {/* SUB-TAB VIEW: 1. DOKTER */}
      {activeSubTab === 'dokter' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-blue-50/50 border border-blue-100/30 p-4 rounded-xl">
            <span className="text-xs font-medium text-blue-800 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              Menghapus data dokter akan menghapus seluruh jadwal praktiknya secara otomatis.
            </span>
            <button
              id="btn-tambah-dokter"
              onClick={() => setIsDokterFormOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-2 transition shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Dokter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dokterList.map((dokter) => (
              <div 
                key={dokter.id_dokter}
                className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 space-y-4 relative hover:shadow-sm hover:border-slate-200/65 transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 text-blue-700 flex items-center justify-center rounded-xl font-bold">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm leading-snug">{dokter.nama_dokter}</h3>
                      <p className="text-xs text-blue-600 font-medium">{dokter.spesialis}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (confirm(`Hapus dokter "${dokter.nama_dokter}"? Ini juga akan menghapus agenda jadwal tugas mereka.`)) {
                        onDeleteDokter(dokter.id_dokter);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-md transition"
                    title="Hapus Dokter"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {dokter.no_hp}
                  </span>
                  
                  <span className="text-[10px] bg-slate-100 hover:bg-slate-200/60 transition px-2 py-0.5 rounded-full text-slate-500 font-medium">
                    ID Dokter: {dokter.id_dokter.substring(0, 5)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB VIEW: 2. POLI DEPARTEMEN */}
      {activeSubTab === 'poli' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List of departments (left 2 cols) */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-xs border border-slate-100 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Daftar Poli Klinik Terdaftar</h2>
            
            <div className="divide-y divide-slate-100">
              {poliList.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada poli terdaftar.</p>
              ) : (
                poliList.map((poli) => (
                  <div key={poli.id_poli} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition">
                    <div className="flex items-center gap-2.5">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-semibold text-slate-700">{poli.nama_poli}</span>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus "${poli.nama_poli}"? Tindakan ini menghapus seluruh jadwal di poli tersebut.`)) {
                          onDeletePoli(poli.id_poli);
                        }
                      }}
                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick inline creation form (right 1 col) */}
          <div className="bg-slate-50/50 border border-slate-200/50 rounded-xl p-5 space-y-4 self-start">
            <div>
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Tambah Poli Baru</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Daftarkan poli rawat jalan baru untuk klinik</p>
            </div>

            <form onSubmit={handleSubmitPoli} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Nama Poli Klinik</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Poli Syaraf, Poli Umum"
                  value={namaPoli}
                  onChange={(e) => setNamaPoli(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 rounded-lg transition shadow-xs"
              >
                {isSaving ? 'Menyimpan...' : 'Tambahkan Poli'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB VIEW: 3. JADWAL DOKTER */}
      {activeSubTab === 'jadwal' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-blue-50/50 border border-blue-100/30 p-4 rounded-xl">
            <span className="text-xs font-medium text-blue-800 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-600" />
              Relasi M:N Dokter & Poli - Tautkan dokter ke poli klinik operasional mereka.
            </span>
            <button
              onClick={() => {
                if (dokterList.length === 0 || poliList.length === 0) {
                  alert('Harap daftarkan dokter dan poli terlebih dahulu sebelum menjadwalkan!');
                  return;
                }
                // Set defaults
                setSelectedDokterId(dokterList[0]?.id_dokter || '');
                setSelectedPoliId(poliList[0]?.id_poli || '');
                setIsJadwalFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-2 transition shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Kelola Jadwal Praktik
            </button>
          </div>

          {/* Schedule display table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
            {jadwalList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xs text-slate-400">Belum ada agenda jadwal penugasan dokter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">Hari Penugasan</th>
                      <th className="py-3 px-5">Nama Dokter</th>
                      <th className="py-3 px-5">Poli Klinik</th>
                      <th className="py-3 px-5">Jam Praktik</th>
                      <th className="py-3 px-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {jadwalList.map((jad) => (
                      <tr key={jad.id_jadwal} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-5 font-semibold text-blue-800">{jad.hari}</td>
                        <td className="py-3.5 px-5 font-medium text-slate-800">{jad.dokter?.nama_dokter || 'Dokter tidak ditemukan'}</td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[10px]">
                            {jad.poli?.nama_poli || 'Poli dihapus'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {jad.jam_mulai} - {jad.jam_selesai}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => {
                              if (confirm('Hapus jadwal penugasan ini?')) {
                                onDeleteJadwal(jad.id_jadwal);
                              }
                            }}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING ACTION DIALOGS */}
      <AnimatePresence>
        {/* Dokter Add Modal */}
        {isDokterFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDokterFormOpen(false)}
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
                  <Plus className="h-5 w-5 text-blue-600" />
                  Tambah Dokter Baru
                </h3>
                <button onClick={() => setIsDokterFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleSubmitDokter} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Nama Lengkap Dokter</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dr. Amanda Safitri, Sp.A"
                    value={namaDokter}
                    onChange={(e) => setNamaDokter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Kategori Spesialis</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Spesialis Anak, Spesialis Mata, Dokter Umum"
                    value={spesialis}
                    onChange={(e) => setSpesialis(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Nomor WhatsApp Aktif</label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 08123456789"
                    value={noHpDokter}
                    onChange={(e) => setNoHpDokter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsDokterFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-800 font-semibold rounded-xl text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                  >
                    {isSaving ? 'Menyimpan...' : 'Tambahkan Dokter'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Jadwal Add Modal */}
        {isJadwalFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsJadwalFormOpen(false)}
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
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  Atur Jadwal Tugas Baru
                </h3>
                <button onClick={() => setIsJadwalFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleSubmitJadwal} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Pilih Dokter</label>
                  <select
                    required
                    value={selectedDokterId}
                    onChange={(e) => setSelectedDokterId(e.target.value)}
                    className="w-full tracking-wide px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {dokterList.map(d => (
                      <option key={d.id_dokter} value={d.id_dokter}>
                        {d.nama_dokter} ({d.spesialis})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Poli Tempat Bertugas</label>
                  <select
                    required
                    value={selectedPoliId}
                    onChange={(e) => setSelectedPoliId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {poliList.map(p => (
                      <option key={p.id_poli} value={p.id_poli}>
                        {p.nama_poli}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Hari Pelayanan</label>
                  <select
                    required
                    value={hari}
                    onChange={(e) => setHari(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Jam Mulai</label>
                    <input
                      type="time"
                      required
                      value={jamMulai}
                      onChange={(e) => setJamMulai(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Jam Selesai</label>
                    <input
                      type="time"
                      required
                      value={jamSelesai}
                      onChange={(e) => setJamSelesai(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsJadwalFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-800 font-semibold rounded-xl text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan Jadwal'}
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

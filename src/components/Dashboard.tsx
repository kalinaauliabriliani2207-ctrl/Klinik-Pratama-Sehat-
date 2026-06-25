/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  Stethoscope, 
  Clock, 
  Activity, 
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Building
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  Pasien, 
  Dokter, 
  Poli, 
  KunjunganWithDetails 
} from '../types';

interface DashboardProps {
  pasienList: Pasien[];
  dokterList: Dokter[];
  poliList: Poli[];
  kunjunganList: KunjunganWithDetails[];
  setActiveTab: (tab: string) => void;
  onQuickRegister: () => void;
}

export default function Dashboard({
  pasienList,
  dokterList,
  poliList,
  kunjunganList,
  setActiveTab,
  onQuickRegister
}: DashboardProps) {
  // Stats
  const totalPasien = pasienList.length;
  const totalDokter = dokterList.length;
  const totalPoli = poliList.length;
  
  const totalKunjungan = kunjunganList.length;
  const antreanMenunggu = kunjunganList.filter(k => k.status === 'menunggu').length;
  const selesaiBerobat = kunjunganList.filter(k => k.status === 'selesai').length;

  // Recent visits (max 4)
  const recentVisits = kunjunganList.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div 
        id="dash-welcome-banner"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 md:p-8 text-white shadow-md"
      >
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/30 px-3 py-1 text-xs font-semibold tracking-wider text-blue-100 uppercase">
              Dashboard Utama
            </span>
            <h1 className="mt-3 text-2xl md:text-3.5xl font-bold tracking-tight">
              Selamat Datang di Portal Manajemen Klinik Pratama
            </h1>
            <p className="mt-2 text-sm md:text-base text-blue-100/90 leading-relaxed">
              Pantau status antrean pasien secara nyata (real-time), verifikasi data rekam medis, dan atur jadwal penugasan dokter spesialis dengan mudah.
            </p>
          </motion.div>

          <motion.div 
            className="mt-6 flex flex-wrap gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              id="dash-btn-kunjungan"
              onClick={onQuickRegister}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-sm transition hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <CalendarDays className="h-4 w-4" />
              Daftarkan Kunjungan Baru
            </button>
            <button
              id="dash-btn-rekam"
              onClick={() => setActiveTab('kunjungan')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500/20 border border-blue-400/30 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500/30"
            >
              <ClipboardCheck className="h-4 w-4" />
              Periksa Antrean Pasien
            </button>
          </motion.div>
        </div>

        {/* Abstract background vector paths */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 hidden md:block">
          <svg className="h-full w-full object-cover" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,40 70,60 100,0 L100,100 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Grid Statistik */}
      <div 
        id="dash-stats-grid"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card Pasien */}
        <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pasien</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalPasien}</h3>
            <span className="text-[11px] text-slate-400">total terdaftar</span>
          </div>
        </div>

        {/* Card Dokter */}
        <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dokter</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{totalDokter}</h3>
            <span className="text-[11px] text-slate-400">tenaga aktif</span>
          </div>
        </div>

        {/* Card Antrean */}
        <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Menunggu</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{antreanMenunggu}</h3>
            <span className="text-[11px] text-amber-600 font-medium">{antreanMenunggu} antrean aktif</span>
          </div>
        </div>

        {/* Card Selesai */}
        <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Selesai</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{selesaiBerobat}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">terlayani hari ini</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Antrean Berjalan (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Antrean Aktif Terkini</h2>
              <p className="text-xs text-slate-500">Pasien yang sedang menunggu panggilan dokter spesialis</p>
            </div>
            <button
              onClick={() => setActiveTab('kunjungan')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5"
            >
              Lihat Semua Antrean
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentVisits.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                <p className="text-sm text-slate-400">Belum ada registrasi kunjungan hari ini</p>
              </div>
            ) : (
              recentVisits.map((visit) => (
                <div 
                  key={visit.id_kunjungan}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full font-bold text-sm shrink-0 mt-0.5">
                      {visit.pasien?.nama?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{visit.pasien?.nama}</h4>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-slate-400" />
                          {visit.jadwal?.poli?.nama_poli || 'Poli Umum'}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-blue-600">
                          {visit.jadwal?.dokter?.nama_dokter}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-600 line-clamp-1 italic bg-white/60 px-2 py-1 rounded border border-slate-100/40">
                        "Keluhan: {visit.keluhan}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-2 sm:pt-0 mt-2 sm:mt-0">
                    <div className="text-xs text-slate-400">
                      📅 {new Date(visit.tanggal_kunjungan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                      visit.status === 'menunggu' 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {visit.status === 'menunggu' ? 'Menunggu' : 'Selesai'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Insights / Poli info (Right 1 col) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Spesialis & Departemen</h2>
              <p className="text-xs text-slate-500">Kapasitas Poli Rawat Jalan Saat Ini</p>
            </div>

            <div className="space-y-2.5">
              {poliList.slice(0, 4).map((p) => {
                const countOfDokter = dokterList.filter(d => 
                  d.spesialis.toLowerCase().includes(p.nama_poli.replace('Poli', '').trim().toLowerCase()) || 
                  (p.nama_poli === 'Poli Umum' && d.spesialis === 'Dokter Umum')
                ).length;

                return (
                  <div key={p.id_poli} className="flex items-center justify-between p-3 bg-blue-50/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-semibold text-slate-700">{p.nama_poli}</span>
                    </div>
                    <span className="text-[11px] font-medium bg-white text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                      {countOfDokter || Math.max(1, countOfDokter)} Dokter
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/20 border border-blue-50 rounded-xl mt-4">
            <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
              💡 Tips Efisiensi
            </h4>
            <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
              Selalu pasangkan dokter dengan jadwal poli yang tepat di menu <strong>Tenaga Medis</strong> sebelum mendaftarkan pasien untuk meminimalkan penumpukan antrean.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

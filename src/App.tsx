/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Home, 
  Users, 
  Stethoscope, 
  Clock, 
  FileText, 
  Database,
  Menu,
  X,
  RefreshCw,
  Building,
  Activity,
  Pill,
  Award,
  Lock,
  Unlock,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClinicalDB } from './db';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA } from './supabaseClient';
import { 
  Pasien, 
  Dokter, 
  Poli, 
  JadwalDokter, 
  Kunjungan, 
  RekamMedis,
  JadwalWithDetails,
  KunjunganWithDetails,
  RekamMedisWithDetails,
  Obat,
  Tindakan
} from './types';

// Importing sub-modules
import PublicPortal from './components/PublicPortal';
import Dashboard from './components/Dashboard';
import PasienManager from './components/PasienManager';
import DokterManager from './components/DokterManager';
import KunjunganManager from './components/KunjunganManager';
import RekamMedisManager from './components/RekamMedisManager';
import ObatManager from './components/ObatManager';
import TindakanManager from './components/TindakanManager';
import MedicalAccessGate from './components/MedicalAccessGate';

export default function App() {
  const [activeTab, setActiveTab] = useState('portal');
  const [isDoctorAuthorized, setIsDoctorAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('isDoctorAuthorized') === 'true';
  });
  const [authorizedUser, setAuthorizedUser] = useState<string>(() => {
    return sessionStorage.getItem('authorizedUser') || '';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = (user: string) => {
    setIsDoctorAuthorized(true);
    setAuthorizedUser(user);
    sessionStorage.setItem('isDoctorAuthorized', 'true');
    sessionStorage.setItem('authorizedUser', user);
  };

  const handleLogout = () => {
    setIsDoctorAuthorized(false);
    setAuthorizedUser('');
    sessionStorage.setItem('isDoctorAuthorized', 'false');
    sessionStorage.setItem('authorizedUser', '');
    setActiveTab('portal');
  };
  
  // Data lists states
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const [pasienList, setPasienList] = useState<Pasien[]>([]);
  const [dokterList, setDokterList] = useState<Dokter[]>([]);
  const [poliList, setPoliList] = useState<Poli[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalWithDetails[]>([]);
  const [kunjunganList, setKunjunganList] = useState<KunjunganWithDetails[]>([]);
  const [rekamMedisList, setRekamMedisList] = useState<RekamMedisWithDetails[]>([]);
  const [obatList, setObatList] = useState<Obat[]>([]);
  const [tindakanList, setTindakanList] = useState<Tindakan[]>([]);

  // Reload action
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [p, d, po, j, k, r, o, t] = await Promise.all([
        ClinicalDB.getPasien(),
        ClinicalDB.getDokter(),
        ClinicalDB.getPoli(),
        ClinicalDB.getJadwalDokter(),
        ClinicalDB.getKunjungan(),
        ClinicalDB.getRekamMedis(),
        ClinicalDB.getObat(),
        ClinicalDB.getTindakan()
      ]);
      setPasienList(p);
      setDokterList(d);
      setPoliList(po);
      setJadwalList(j);
      setKunjunganList(k);
      setRekamMedisList(r);
      setObatList(o);
      setTindakanList(t);
      setSchemaMissing(ClinicalDB.hasSchemaError());
    } catch (e) {
      console.error('Failed to load clinic data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ------------------------------------------
  // DATABASE WRITERS FOR PROPAGATION
  // ------------------------------------------
  
  // 1. Pasien Handlers
  const handleAddPasien = async (pasien: Omit<Pasien, 'id_pasien'>) => {
    const created = await ClinicalDB.addPasien(pasien);
    await loadAllData();
    return created;
  };

  const handleUpdatePasien = async (id: string, updated: Partial<Pasien>) => {
    await ClinicalDB.updatePasien(id, updated);
    await loadAllData();
  };

  const handleDeletePasien = async (id: string) => {
    await ClinicalDB.deletePasien(id);
    await loadAllData();
  };

  // 2. Dokter Handlers
  const handleAddDokter = async (dokter: Omit<Dokter, 'id_dokter'>) => {
    await ClinicalDB.addDokter(dokter);
    await loadAllData();
  };

  const handleDeleteDokter = async (id: string) => {
    await ClinicalDB.deleteDokter(id);
    await loadAllData();
  };

  // 3. Poli Handlers
  const handleAddPoli = async (poli: Omit<Poli, 'id_poli'>) => {
    await ClinicalDB.addPoli(poli);
    await loadAllData();
  };

  const handleDeletePoli = async (id: string) => {
    await ClinicalDB.deletePoli(id);
    await loadAllData();
  };

  // 4. Jadwal Handlers
  const handleAddJadwal = async (jadwal: Omit<JadwalDokter, 'id_jadwal'>) => {
    await ClinicalDB.addJadwalDokter(jadwal);
    await loadAllData();
  };

  const handleDeleteJadwal = async (id: string) => {
    await ClinicalDB.deleteJadwalDokter(id);
    await loadAllData();
  };

  // 5. Kunjungan Handlers
  const handleAddKunjungan = async (kunjungan: Omit<Kunjungan, 'id_kunjungan'>) => {
    const created = await ClinicalDB.addKunjungan(kunjungan);
    await loadAllData();
    return created;
  };

  const handleUpdateKunjunganStatus = async (id: string, status: 'menunggu' | 'selesai') => {
    await ClinicalDB.updateKunjunganStatus(id, status);
    await loadAllData();
  };

  const handleDeleteKunjungan = async (id: string) => {
    await ClinicalDB.deleteKunjungan(id);
    await loadAllData();
  };

  // 6. Rekam Medis Handlers
  const handleAddRekamMedis = async (
    rekam: Omit<RekamMedis, 'id_rekam'>,
    selectedObats: { id_obat: string; jumlah: number; aturan_pakai: string }[],
    selectedTindakans: string[]
  ) => {
    await ClinicalDB.addRekamMedisWithSubTables(rekam, selectedObats, selectedTindakans);
    await loadAllData();
  };

  const handleDeleteRekamMedis = async (id: string) => {
    await ClinicalDB.deleteRekamMedis(id);
    await loadAllData();
  };

  // 7. Obat Handlers
  const handleAddObat = async (obat: Omit<Obat, 'id_obat'>) => {
    await ClinicalDB.addObat(obat);
    await loadAllData();
  };

  const handleUpdateObat = async (id: string, updated: Partial<Obat>) => {
    await ClinicalDB.updateObat(id, updated);
    await loadAllData();
  };

  const handleDeleteObat = async (id: string) => {
    await ClinicalDB.deleteObat(id);
    await loadAllData();
  };

  // 8. Tindakan Handlers
  const handleAddTindakan = async (tindakan: Omit<Tindakan, 'id_tindakan'>) => {
    await ClinicalDB.addTindakan(tindakan);
    await loadAllData();
  };

  const handleUpdateTindakan = async (id: string, updated: Partial<Tindakan>) => {
    await ClinicalDB.updateTindakan(id, updated);
    await loadAllData();
  };

  const handleDeleteTindakan = async (id: string) => {
    await ClinicalDB.deleteTindakan(id);
    await loadAllData();
  };

  // Navigation schema
  const navItems = [
    { id: 'portal', label: 'Layanan Utama Web', icon: Home },
    { id: 'dashboard', label: 'Monitor Antrean', icon: Activity },
    { id: 'pasien', label: 'Database Pasien', icon: Users },
    { id: 'dokter', label: 'Tenaga Medis', icon: Stethoscope },
    { id: 'obat', label: 'Data Obat', icon: Pill },
    { id: 'tindakan', label: 'Tindakan Medis', icon: Award },
    { id: 'kunjungan', label: 'Registrasi Kunjungan', icon: Clock },
    { id: 'rekam', label: 'Rekam Medis Pasien', icon: FileText },
  ];

  const isTabPrivate = ['pasien', 'dokter', 'obat', 'tindakan', 'kunjungan', 'rekam'].includes(activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* SINGLE-ROW PREMIUM HEADER */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-xs shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setActiveTab('portal')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer select-none group"
          >
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/10 group-hover:bg-blue-700 transition">
              <HeartPulse className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-700 transition">Klinik Sehat</h1>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600 mt-1 block">E-Health Portal</span>
            </div>
          </div>

          {/* Desktop Single-Tier Flat Navigation Pills */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems
              .filter((item) => {
                const isPrivate = ['pasien', 'dokter', 'obat', 'tindakan', 'kunjungan', 'rekam'].includes(item.id);
                return !isPrivate || isDoctorAuthorized;
              })
              .map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                
                // Simplify long labels for sleek header fit
                const shortLabel = item.label
                  .replace('Layanan Utama Web', 'Portal')
                  .replace('Monitor Antrean', 'Antrean')
                  .replace('Database Pasien', 'Pasien')
                  .replace('Tenaga Medis', 'Dokter')
                  .replace('Data Obat', 'Obat')
                  .replace('Tindakan Medis', 'Tindakan')
                  .replace('Registrasi Kunjungan', 'Registrasi')
                  .replace('Rekam Medis Pasien', 'Rekam Medis');

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition duration-150 cursor-pointer shrink-0 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <IconComp className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{shortLabel}</span>
                  </button>
                );
              })}
          </nav>

          {/* Right Area: Session management and DB Status */}
          <div className="flex items-center gap-3">
            {/* Active User Status Badge */}
            <div className="hidden sm:flex items-center gap-2">
              {isDoctorAuthorized ? (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1 text-emerald-800 text-[11px] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate max-w-[130px] font-extrabold">{authorizedUser}</span>
                  <button 
                    onClick={handleLogout} 
                    title="Klik untuk Keluar"
                    className="ml-1 text-[10px] text-rose-600 hover:text-rose-800 font-extrabold border-l border-emerald-200 pl-2 cursor-pointer focus:outline-none"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    // Navigate to a secure clinical tab which displays the Secure Access Gate login
                    setActiveTab('pasien');
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] border border-blue-150 rounded-xl font-bold transition duration-150 shrink-0 cursor-pointer flex items-center gap-1.5 focus:outline-none"
                >
                  <Lock className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                  Masuk Dokter
                </button>
              )}

              {/* Minimal Reload Data Button */}
              <button 
                onClick={loadAllData}
                title="Refresh Database Klinik"
                className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-blue-600 rounded-xl transition cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>

            {/* Micro Database Status Indicator LED */}
            <div 
              title={isSupabaseConfigured ? "Sistem Database Cloud Aktif" : "Menjalankan Demo Penyimpanan Lokal"}
              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                isSupabaseConfigured 
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-400' 
                  : 'bg-amber-400 shadow-sm shadow-amber-300'
              }`} 
            />

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-slate-200 lg:hidden rounded-xl text-slate-600 transition cursor-pointer hover:bg-slate-55 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5 text-slate-700" />}
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE DRAWER CONTAINER (Reactive) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-45 md:hidden">
            {/* Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs"
            />

            {/* Sidebar Panel overlay slide-out */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-64 bg-white p-5 space-y-4 shadow-xl border-r border-slate-100 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <HeartPulse className="h-5 w-5 text-blue-600 animate-pulse" />
                    <span>E-Health Portal</span>
                  </h2>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded bg-slate-50 text-slate-500 cursor-pointer">
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Simulation block inside mobile menu */}
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Simulasi Peran</div>
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {isDoctorAuthorized ? `👨‍⚕️ ${authorizedUser}` : '👤 Pasien Umum'}
                  </div>
                  {isDoctorAuthorized ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-1 text-center bg-rose-50 border border-rose-100 rounded text-[10px] text-rose-700 font-bold cursor-pointer"
                    >
                      Keluar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('pasien');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-1.5 text-center bg-blue-50 border border-blue-200 rounded text-[10px] text-blue-700 font-bold cursor-pointer focus:outline-none"
                    >
                      Buka Gerbang Dokter
                    </button>
                  )}
                </div>

                {/* Public list */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-blue-600 block px-3 py-0.5">Layanan Publik</span>
                  <nav className="space-y-0.5">
                    {navItems
                      .filter(item => ['portal', 'dashboard', 'supabase'].includes(item.id))
                      .map((item) => {
                        const IconComp = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              isActive 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <IconComp className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                  </nav>
                </div>

                {/* Private list */}
                {isDoctorAuthorized && (
                  <div className="space-y-1 border-t border-slate-100 pt-3">
                    <span className="text-[9px] uppercase tracking-widest font-extrabold text-blue-600 block px-3 py-0.5 flex items-center justify-between">
                      <span>Unit Medis</span>
                    </span>
                    <nav className="space-y-0.5">
                      {navItems
                        .filter(item => ['pasien', 'dokter', 'obat', 'tindakan', 'kunjungan', 'rekam'].includes(item.id))
                        .map((item) => {
                          const IconComp = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                isActive 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <IconComp className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span>{item.label}</span>
                              </div>
                            </button>
                          );
                        })}
                    </nav>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
                <span className="text-slate-400 block text-[10px]">Database Terhubung</span>
                <strong className="text-slate-700 block mt-0.5">{isSupabaseConfigured ? 'PostgreSQL Cloud Storage' : 'Browser LocalStorage'}</strong>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* PRIMARY VIEW CONTENT WORKSPACE PORT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500 tracking-wide animate-pulse">Menghubungkan ke database klinik...</p>
            </div>
          ) : (
            <>
              {isSupabaseConfigured && schemaMissing && (
                <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-200/60">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0 mt-0.5">
                        <Database className="h-5 w-5 text-amber-600 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">⚠️ Tabel Database Supabase Belum Terbentuk / Terdeteksi Kosong</h3>
                        <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                          Koneksi Supabase Anda aktif, namun sistem mendeteksi tabel klinik (seperti <code className="font-mono bg-amber-150 px-1 py-0.5 rounded text-amber-800">pasien</code>, <code className="font-mono bg-amber-150 px-1 py-0.5 rounded text-amber-800 font-bold">dokter</code>, atau <code className="font-mono bg-amber-150 px-1 py-0.5 rounded text-amber-800">kunjungan</code>) belum dibuat di Database Cloud Anda.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-extrabold transition flex items-center justify-center gap-1.5 self-start md:self-auto cursor-pointer focus:outline-none"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{copied ? 'Tersalin!' : 'Salin Skema SQL'}</span>
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-bold text-slate-700">Cara Penginstalan Skema:</p>
                    <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 pl-1 leading-relaxed">
                      <li>Buka halaman dashboard proyek Anda di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 font-extrabold underline">Supabase Console</a></li>
                      <li>Masuk ke menu <strong className="text-slate-800">SQL Editor</strong> di bilah sidebar kiri</li>
                      <li>Buat query baru dengan mengeklik <strong className="text-slate-800">New Query</strong></li>
                      <li>Paste/tempel kode SQL Schema yang sudah disalin di atas, lalu klik tombol <strong className="text-slate-800">Run</strong></li>
                      <li>Terakhir, klik tombol <strong>Refresh Database Klinik</strong> (ikon putar) di bagian atas kanan menu web ini agar sistem memuat data antrean dan poliklinik dari database cloud secara otomatis!</li>
                    </ol>

                    <div className="mt-4 bg-slate-900 text-slate-300 p-4 rounded-2xl text-[10px] font-mono leading-relaxed max-h-48 overflow-y-auto border border-slate-850 whitespace-pre-wrap select-all">
                      {SUPABASE_SQL_SCHEMA}
                    </div>
                  </div>
                </div>
              )}

              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
              {isTabPrivate && !isDoctorAuthorized ? (
                <MedicalAccessGate 
                  onAuthorize={handleLogin}
                  onGoToTab={setActiveTab}
                  targetTabLabel={navItems.find(item => item.id === activeTab)?.label || 'Menu Medis'}
                  dokterList={dokterList}
                  onAddDokter={handleAddDokter}
                />
              ) : (
                <>
                  {activeTab === 'portal' && (
                    <PublicPortal 
                      pasienList={pasienList}
                      dokterList={dokterList}
                      poliList={poliList}
                      jadwalList={jadwalList}
                      onAddPasien={handleAddPasien}
                      onAddKunjungan={handleAddKunjungan}
                      setActiveTab={setActiveTab}
                    />
                  )}

                  {activeTab === 'dashboard' && (
                    <Dashboard 
                      pasienList={pasienList}
                      dokterList={dokterList}
                      poliList={poliList}
                      kunjunganList={kunjunganList}
                      setActiveTab={setActiveTab}
                      onQuickRegister={() => setActiveTab('kunjungan')}
                    />
                  )}

                  {activeTab === 'pasien' && (
                    <PasienManager 
                      pasienList={pasienList}
                      onAddPasien={handleAddPasien}
                      onUpdatePasien={handleUpdatePasien}
                      onDeletePasien={handleDeletePasien}
                    />
                  )}

                  {activeTab === 'dokter' && (
                    <DokterManager 
                      dokterList={dokterList}
                      poliList={poliList}
                      jadwalList={jadwalList}
                      onAddDokter={handleAddDokter}
                      onDeleteDokter={handleDeleteDokter}
                      onAddPoli={handleAddPoli}
                      onDeletePoli={handleDeletePoli}
                      onAddJadwal={handleAddJadwal}
                      onDeleteJadwal={handleDeleteJadwal}
                    />
                  )}

                  {activeTab === 'kunjungan' && (
                    <KunjunganManager 
                      kunjunganList={kunjunganList}
                      pasienList={pasienList}
                      jadwalList={jadwalList}
                      obatList={obatList}
                      tindakanList={tindakanList}
                      onAddKunjungan={handleAddKunjungan}
                      onUpdateStatus={handleUpdateKunjunganStatus}
                      onDeleteKunjungan={handleDeleteKunjungan}
                      onAddRekamMedis={handleAddRekamMedis}
                    />
                  )}

                  {activeTab === 'obat' && (
                    <ObatManager 
                      obatList={obatList}
                      onAddObat={handleAddObat}
                      onUpdateObat={handleUpdateObat}
                      onDeleteObat={handleDeleteObat}
                    />
                  )}

                  {activeTab === 'tindakan' && (
                    <TindakanManager 
                      tindakanList={tindakanList}
                      onAddTindakan={handleAddTindakan}
                      onUpdateTindakan={handleUpdateTindakan}
                      onDeleteTindakan={handleDeleteTindakan}
                    />
                  )}

                  {activeTab === 'rekam' && (
                    <RekamMedisManager 
                      rekamMedisList={rekamMedisList}
                      onDeleteRekam={handleDeleteRekamMedis}
                    />
                  )}
                </>
              )}
            </motion.div>
          </>
          )}
        </main>

      {/* FOOTER NOTIFY MARGIN CLUTTER PROTECTION */}
      <footer className="bg-white border-t border-slate-100 py-3 px-6 text-center text-[10px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <p>© 2026 Klinik Informasi Pratama Sehat. Sistem E-Health Terintegrasi.</p>
        <p className="font-mono text-slate-350">Platform Status: {isSupabaseConfigured ? 'Cloud Database Active' : 'Offline Mode (Local Storage)'}</p>
      </footer>
    </div>
  );
}

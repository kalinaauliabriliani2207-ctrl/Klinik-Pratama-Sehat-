/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  KeyRound, 
  CheckCircle2, 
  ArrowLeft, 
  Home, 
  Activity, 
  Lock,
  Unlock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Stethoscope,
  Phone
} from 'lucide-react';
import { motion } from 'motion/react';
import { Dokter } from '../types';

interface MedicalAccessGateProps {
  onAuthorize: (userName: string) => void;
  onGoToTab: (tab: string) => void;
  targetTabLabel: string;
  dokterList: Dokter[];
  onAddDokter: (dokter: Omit<Dokter, 'id_dokter'>) => Promise<any>;
}

export default function MedicalAccessGate({
  onAuthorize,
  onGoToTab,
  targetTabLabel,
  dokterList,
  onAddDokter
}: MedicalAccessGateProps) {
  const [activeSubTab, setActiveSubTab] = useState<'login' | 'register'>('login');
  
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register Form States
  const [regType, setRegType] = useState<'existing' | 'new'>('existing');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  
  const [regNama, setRegNama] = useState('');
  const [regSpesialis, setRegSpesialis] = useState('');
  const [regNoHp, setRegNoHp] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');

  // Seed default account 'alditrio' with sandi '1234' if not present
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('klinik_clinical_accounts');
      const accounts = stored ? JSON.parse(stored) : [];
      const hasAlditrio = accounts.some((acc: any) => acc.username.toLowerCase() === 'alditrio');
      if (!hasAlditrio) {
        const targetDoc = dokterList.find(d => d.nama_dokter.includes('Bambang')) || dokterList[0];
        accounts.push({
          username: 'alditrio',
          password: '1234',
          nama_dokter: targetDoc ? targetDoc.nama_dokter : 'Dr. Bambang Setiadi, Sp.PD',
          id_dokter: targetDoc ? String(targetDoc.id_dokter) : '1'
        });
        localStorage.setItem('klinik_clinical_accounts', JSON.stringify(accounts));
      }
    } catch (e) {
      console.error('Failed to seed default account:', e);
    }
  }, [dokterList]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Username dan Password wajib diisi!');
      return;
    }

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Get accounts from local storage
    const stored = localStorage.getItem('klinik_clinical_accounts');
    const accounts = stored ? JSON.parse(stored) : [];

    // Find custom registered doctor account matching username & password
    const foundAcc = accounts.find(
      (acc: any) => acc.username.toLowerCase() === cleanUser && acc.password === cleanPass
    );

    if (foundAcc) {
      triggerSuccess(foundAcc.nama_dokter);
    } else {
      setErrorMessage('Username atau password PIN salah! Silakan buat/tambah akun dokter terlebih dahulu di tab "Registrasi Dokter".');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanRegUser = regUsername.trim().toLowerCase();
    const cleanRegPass = regPassword.trim();

    if (!cleanRegUser || !cleanRegPass) {
      setErrorMessage('Username dan Password PIN wajib diisi!');
      return;
    }

    // Load existing accounts
    const stored = localStorage.getItem('klinik_clinical_accounts');
    const accounts = stored ? JSON.parse(stored) : [];

    if (accounts.some((acc: any) => acc.username.toLowerCase() === cleanRegUser)) {
      setErrorMessage('Username tersebut sudah digunakan! Silakan gunakan username lain.');
      return;
    }

    try {
      let finalNama = '';
      let finalId = '';

      if (regType === 'existing') {
        if (!selectedDoctorId) {
          setErrorMessage('Silakan pilih salah satu dokter yang terdaftar!');
          return;
        }

        const docMatch = dokterList.find(d => String(d.id_dokter) === String(selectedDoctorId));
        if (!docMatch) {
          setErrorMessage('Dokter pilihan Anda tidak valid.');
          return;
        }

        finalNama = docMatch.nama_dokter;
        finalId = String(docMatch.id_dokter);
      } else {
        // Registering a brand new doctor profile
        if (!regNama.trim() || !regSpesialis.trim() || !regNoHp.trim()) {
          setErrorMessage('Mohon lengkapi seluruh profil dokter baru!');
          return;
        }

        // 1. Save doctor database entry
        const createdDokter = await onAddDokter({
          nama_dokter: regNama.trim(),
          spesialis: regSpesialis.trim(),
          no_hp: regNoHp.trim()
        });

        finalNama = regNama.trim();
        finalId = createdDokter?.id_dokter || `doc-${Date.now()}`;
      }

      // 2. Add credentials account record
      const newAccount = {
        username: cleanRegUser,
        password: cleanRegPass,
        nama_dokter: finalNama,
        id_dokter: finalId
      };

      accounts.push(newAccount);
      localStorage.setItem('klinik_clinical_accounts', JSON.stringify(accounts));

      // 3. Clear & notify success
      setErrorMessage('');
      setRegSuccessMessage(`Registrasi akun untuk "${finalNama}" sukses! Silakan login.`);
      
      setRegNama('');
      setRegSpesialis('');
      setRegNoHp('');
      setRegUsername('');
      setRegPassword('');
      setSelectedDoctorId('');

      setTimeout(() => {
        setActiveSubTab('login');
        setRegSuccessMessage('');
      }, 1800);

    } catch (err: any) {
      setErrorMessage('Gagal mendaftarkan akun dokter: ' + (err.message || String(err)));
    }
  };

  const triggerSuccess = (authorizedAs: string) => {
    setSuccess(true);
    setSuccessName(authorizedAs);
    setErrorMessage('');
    setTimeout(() => {
      onAuthorize(authorizedAs);
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto my-6">
      <motion.div 
        id="gate-login-container"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-150 overflow-hidden relative"
      >
        {/* Soft abstract brand ambient blurs */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 px-6 py-7 text-center text-white relative">
          <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
          <div className="relative z-10 space-y-2.5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              {success ? (
                <Unlock className="h-6 w-6 text-emerald-300 animate-pulse" />
              ) : (
                <Lock className="h-6 w-6 text-blue-200" />
              )}
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/20 border border-rose-400/20 rounded-full text-[9px] uppercase tracking-wider font-extrabold text-rose-200">
                <ShieldAlert className="h-3 w-3 inline" />
                <span>Konsol Terproteksi Medis</span>
              </div>
              <h1 className="text-xl font-black tracking-tight mt-1">
                Autentikasi Klinik
              </h1>
              <p className="text-[11px] text-blue-100/80 max-w-sm mx-auto font-medium leading-relaxed">
                Akses terproteksi bagi tenaga medis berwenang untuk mengelola menu privat <strong className="text-white font-bold">"{targetTabLabel}"</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Subtabs Selector */}
        {!success && (
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('login');
                setErrorMessage('');
              }}
              className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer ${
                activeSubTab === 'login'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5 animate-pulse" />
              Masuk Konsol
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('register');
                setErrorMessage('');
              }}
              className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer ${
                activeSubTab === 'register'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Registrasi Dokter
            </button>
          </div>
        )}

        {/* Gate Content Workspace */}
        <div className="p-6 md:p-8 space-y-6">
          {success ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="h-9 w-9 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base">Autentikasi Berhasil!</h3>
                <p className="text-xs text-slate-500">
                  Selamat Datang, <strong className="text-blue-700 font-extrabold">{successName}</strong>.
                </p>
                <p className="text-[10px] text-emerald-600 font-bold tracking-wide animate-pulse mt-1">
                  Membuka akses modul medis privat...
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] font-semibold text-rose-700 text-center"
                >
                  ⚠️ {errorMessage}
                </motion.div>
              )}

              {regSuccessMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-semibold text-emerald-700 text-center"
                >
                  🎉 {regSuccessMessage}
                </motion.div>
              )}

              {/* Login Tab */}
              {activeSubTab === 'login' && (
                <form onSubmit={handleManualSubmit} className="space-y-4 max-w-sm mx-auto">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block">Username</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Masukkan username Anda"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block">Password PIN Keamanan</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password PIN Anda"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMessage) setErrorMessage('');
                        }}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none transition-all font-mono tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-0.5"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Masuk Ke Konsol Medis
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl font-medium inline-block">
                      💡 Kredensial Akses: Gunakan username <strong className="text-slate-700">Alditrio</strong> & PIN <strong className="text-slate-700 font-mono">1234</strong>
                    </span>
                  </div>
                </form>
              )}

              {/* Register Tab */}
              {activeSubTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-w-sm mx-auto">
                  {/* Select register type */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-center text-[10px] font-extrabold mb-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRegType('existing');
                        setErrorMessage('');
                      }}
                      className={`py-1.5 rounded-lg transition-all focus:outline-none cursor-pointer ${regType === 'existing' ? 'bg-white text-blue-700 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Pilih Dokter yang Sudah Ada
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRegType('new');
                        setErrorMessage('');
                      }}
                      className={`py-1.5 rounded-lg transition-all focus:outline-none cursor-pointer ${regType === 'new' ? 'bg-white text-blue-700 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Tambah Profil Baru
                    </button>
                  </div>

                  {regType === 'existing' ? (
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block">Pilih Dokter</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <select
                          value={selectedDoctorId}
                          onChange={(e) => {
                            setSelectedDoctorId(e.target.value);
                            if (errorMessage) setErrorMessage('');
                          }}
                          className="w-full pl-10 pr-8 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="">-- Pilih Dokter Terdaftar --</option>
                          {dokterList.map((doc) => (
                            <option key={doc.id_dokter} value={doc.id_dokter}>
                              {doc.nama_dokter} - {doc.spesialis || 'Umum'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">Daftar dokter yang sudah ada di database klinis namun belum memiliki akun login.</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block">Nama Lengkap Dokter</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input 
                            type="text"
                            placeholder="Contoh: Dr. Clara Amalia, Sp.A"
                            value={regNama}
                            onChange={(e) => {
                              setRegNama(e.target.value);
                              if (errorMessage) setErrorMessage('');
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block">Spesialisasi</label>
                        <div className="relative">
                          <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input 
                            type="text"
                            placeholder="Contoh: Spesialis Anak, Umum, Gigi"
                            value={regSpesialis}
                            onChange={(e) => {
                              setRegSpesialis(e.target.value);
                              if (errorMessage) setErrorMessage('');
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block">No. HP / Telepon</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input 
                            type="text"
                            placeholder="Contoh: 08123456789"
                            value={regNoHp}
                            onChange={(e) => {
                              setRegNoHp(e.target.value);
                              if (errorMessage) setErrorMessage('');
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1 border-t border-slate-100 pt-3.5">
                    <span className="text-[10px] uppercase font-black text-blue-600 block mb-2 tracking-wider">Kredensial Login Baru</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Username</label>
                        <input 
                          type="text"
                          placeholder="Contoh: bambang"
                          value={regUsername}
                          onChange={(e) => {
                            setRegUsername(e.target.value);
                            if (errorMessage) setErrorMessage('');
                          }}
                          className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Password / PIN</label>
                        <input 
                          type="password"
                          placeholder="Min 4 karakter"
                          value={regPassword}
                          onChange={(e) => {
                            setRegPassword(e.target.value);
                            if (errorMessage) setErrorMessage('');
                          }}
                          className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition active:scale-[0.99] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-3.5"
                  >
                    <UserPlus className="h-4 w-4" />
                    Buat Akun Login Dokter
                  </button>
                </form>
              )}

              {/* Navigation help links */}
              <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onGoToTab('portal')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Portal Publik
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onGoToTab('portal')}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <Home className="h-3.5 w-3.5" /> Pendaftaran Pasien
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => onGoToTab('dashboard')}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    <Activity className="h-3.5 w-3.5" /> Antrean Real-time
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}


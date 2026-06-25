/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
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
  ResepObat,
  Tindakan,
  TindakanPasien,
  ResepObatWithDetails,
  TindakanPasienWithDetails
} from './types';

// ==========================================
// SEED DATA FOR LOCAL STORAGE (CLEAK SLATE FOR SUPABASE CONVERSION)
// ==========================================

const SEED_PASIEN: Pasien[] = [];
const SEED_DOKTER: Dokter[] = [];
const SEED_POLI: Poli[] = [];
const SEED_JADWAL: JadwalDokter[] = [];
const SEED_KUNJUNGAN: Kunjungan[] = [];
const SEED_REKAM_MEDIS: RekamMedis[] = [];
const SEED_OBAT: Obat[] = [];
const SEED_TINDAKAN: Tindakan[] = [];
const SEED_RESEP_OBAT: ResepObat[] = [];
const SEED_TINDAKAN_PASIEN: TindakanPasien[] = [];

// Force clear previously populated demo local storage data once to guarantee a pristine slate
if (typeof window !== 'undefined' && !localStorage.getItem('klinik_clean_slate_v9')) {
  localStorage.removeItem('klinik_pasien');
  localStorage.removeItem('klinik_dokter');
  localStorage.removeItem('klinik_poli');
  localStorage.removeItem('klinik_jadwal');
  localStorage.removeItem('klinik_kunjungan');
  localStorage.removeItem('klinik_rekam');
  localStorage.removeItem('klinik_obat');
  localStorage.removeItem('klinik_tindakan');
  localStorage.removeItem('klinik_resep_obat');
  localStorage.removeItem('klinik_tindakan_pasien');
  localStorage.setItem('klinik_clean_slate_v9', 'true');
}


// ==========================================
// LOCAL STORAGE HELPER FUNCTIONS
// ==========================================

const getLocalStorageItem = <T>(key: string, defaultValue: T[]): T[] => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch (e) {
    return defaultValue;
  }
};

const setLocalStorageItem = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ==========================================
// UNIFIED CLINICAL DATABASE SERVICE
// ==========================================

export const ClinicalDB = {
  // Check if Supabase schema is missing/uncreated
  hasSchemaError() {
    return typeof window !== 'undefined' && (window as any).isSupabaseSchemaMissing === true;
  },

  // Auto-seed default clinic records if Supabase tables reside but are completely empty
  async seedSupabaseIfNeeded() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      // 1. Double check if doctor query succeeds and has entries
      const { data: currentDokter, error: de } = await supabase.from('dokter').select('id_dokter').limit(1);
      
      if (de) {
        // Table doesn't exist yet! Let's set schema error flag
        if (de.code === '42P01' || de.message?.includes('does not exist')) {
          (window as any).isSupabaseSchemaMissing = true;
        }
        return;
      }

      // If table exists, mark schema as successfully verified
      (window as any).isSupabaseSchemaMissing = false;

      // If already has doctor data, do not overwrite default seed
      if (currentDokter && currentDokter.length > 0) {
        return;
      }

      console.log('Database Supabase kosong. Memulai inisialisasi seed data klinik otomatis...');

      // A. Seed Poliklinik
      const defaultPolis = [
        { nama_poli: 'Umum' },
        { nama_poli: 'Gigi & Mulut' },
        { nama_poli: 'Penyakit Dalam' },
        { nama_poli: 'Anak & Tumbuh Kembang' },
        { nama_poli: 'Kandungan (OBGYN)' }
      ];
      const { data: seededPolis, error: pe } = await supabase.from('poli').insert(defaultPolis).select();
      if (pe || !seededPolis || seededPolis.length === 0) return;

      // B. Seed Dokter Spesialis
      const defaultDokters = [
        { nama_dokter: 'Dr. Bambang Setiadi, Sp.PD', spesialis: 'Penyakit Dalam', no_hp: '081234567801' },
        { nama_dokter: 'Dr. Clara Amalia, Sp.A', spesialis: 'Dokter Anak', no_hp: '081234567802' },
        { nama_dokter: 'Drg. Faisal Haris', spesialis: 'Dokter Gigi', no_hp: '081234567803' },
        { nama_dokter: 'Dr. Lestari Astuti, Sp.OG', spesialis: 'Kandungan', no_hp: '081234567804' },
        { nama_dokter: 'Dr. Denny Pratama', spesialis: 'Umum', no_hp: '081234567805' }
      ];
      const { data: seededDokters, error: dke } = await supabase.from('dokter').insert(defaultDokters).select();
      if (dke || !seededDokters || seededDokters.length === 0) return;

      // C. Seed Pasien Awal
      const defaultPasien = [
        { nama: 'Budi Santoso', jenis_kelamin: 'Laki-laki', tgl_lahir: '1988-04-12', alamat: 'Jl. Merdeka No. 45, Purwokerto', no_hp: '085712345671' },
        { nama: 'Siti Aminah', jenis_kelamin: 'Perempuan', tgl_lahir: '1995-11-23', alamat: 'Jl. Sudirman Gg. Melati No. 8', no_hp: '085712345672' },
        { nama: 'Andi Wijaya', jenis_kelamin: 'Laki-laki', tgl_lahir: '2010-01-05', alamat: 'Perumahan Soka Indah Blok C/3', no_hp: '085712345673' },
        { nama: 'Dewi Lestari', jenis_kelamin: 'Perempuan', tgl_lahir: '1992-08-30', alamat: 'Jl. Ahmad Yani No. 12', no_hp: '085712345674' }
      ];
      const { data: seededPasien, error: pse } = await supabase.from('pasien').insert(defaultPasien).select();
      if (pse || !seededPasien || seededPasien.length === 0) return;

      // D. Seed Jadwal Dokter penugasan poli
      const seededPoliUmum = seededPolis.find(p => p.nama_poli === 'Umum');
      const seededPoliDalam = seededPolis.find(p => p.nama_poli === 'Penyakit Dalam');
      const seededPoliAnak = seededPolis.find(p => p.nama_poli === 'Anak & Tumbuh Kembang');
      const seededPoliGigi = seededPolis.find(p => p.nama_poli === 'Gigi & Mulut');

      const docBambang = seededDokters.find(d => d.nama_dokter.includes('Bambang'));
      const docClara = seededDokters.find(d => d.nama_dokter.includes('Clara'));
      const docFaisal = seededDokters.find(d => d.nama_dokter.includes('Faisal'));
      const docDenny = seededDokters.find(d => d.nama_dokter.includes('Denny'));

      const defaultJadwals = [];
      if (docDenny && seededPoliUmum) {
        defaultJadwals.push({ id_dokter: docDenny.id_dokter, id_poli: seededPoliUmum.id_poli, hari: 'Senin', jam_mulai: '08:00', jam_selesai: '12:00' });
        defaultJadwals.push({ id_dokter: docDenny.id_dokter, id_poli: seededPoliUmum.id_poli, hari: 'Rabu', jam_mulai: '08:00', jam_selesai: '12:00' });
      }
      if (docBambang && seededPoliDalam) {
        defaultJadwals.push({ id_dokter: docBambang.id_dokter, id_poli: seededPoliDalam.id_poli, hari: 'Selasa', jam_mulai: '09:00', jam_selesai: '14:00' });
        defaultJadwals.push({ id_dokter: docBambang.id_dokter, id_poli: seededPoliDalam.id_poli, hari: 'Kamis', jam_mulai: '09:00', jam_selesai: '14:00' });
      }
      if (docClara && seededPoliAnak) {
        defaultJadwals.push({ id_dokter: docClara.id_dokter, id_poli: seededPoliAnak.id_poli, hari: 'Senin', jam_mulai: '13:00', jam_selesai: '17:00' });
        defaultJadwals.push({ id_dokter: docClara.id_dokter, id_poli: seededPoliAnak.id_poli, hari: 'Jumat', jam_mulai: '13:00', jam_selesai: '17:00' });
      }
      if (docFaisal && seededPoliGigi) {
        defaultJadwals.push({ id_dokter: docFaisal.id_dokter, id_poli: seededPoliGigi.id_poli, hari: 'Sabtu', jam_mulai: '08:00', jam_selesai: '13:00' });
      }

      if (defaultJadwals.length === 0) return;
      const { data: seededJadwals, error: jde } = await supabase.from('jadwal_dokter').insert(defaultJadwals).select();
      if (jde || !seededJadwals || seededJadwals.length === 0) return;

      // E. Seed Kunjungan Antrean Pasien Hari Ini
      const pBudi = seededPasien.find(p => p.nama.includes('Budi'));
      const pSiti = seededPasien.find(p => p.nama.includes('Siti'));
      const pAndi = seededPasien.find(p => p.nama.includes('Andi'));

      const jUmum = seededJadwals.find(j => j.id_dokter === docDenny?.id_dokter);
      const jDalam = seededJadwals.find(j => j.id_dokter === docBambang?.id_dokter);
      const jAnak = seededJadwals.find(j => j.id_dokter === docClara?.id_dokter);

      const defaultKunjungans = [];
      const todayISO = new Date().toISOString().substring(0, 10);
      if (pBudi && jUmum) {
        defaultKunjungans.push({ id_pasien: pBudi.id_pasien, id_jadwal: jUmum.id_jadwal, tanggal_kunjungan: todayISO, keluhan: 'Pusing dan demam tinggi sejak kemarin', status: 'menunggu' });
      }
      if (pSiti && jDalam) {
        defaultKunjungans.push({ id_pasien: pSiti.id_pasien, id_jadwal: jDalam.id_jadwal, tanggal_kunjungan: todayISO, keluhan: 'Nyeri ulu hati hebat disertai mual', status: 'menunggu' });
      }
      if (pAndi && jAnak) {
        defaultKunjungans.push({ id_pasien: pAndi.id_pasien, id_jadwal: jAnak.id_jadwal, tanggal_kunjungan: todayISO, keluhan: 'Batuk pilek dan demam rewel', status: 'menunggu' });
      }

      if (defaultKunjungans.length > 0) {
        await supabase.from('kunjungan').insert(defaultKunjungans);
      }

      // F. Seed Obat Awal
      const defaultObats = [
        { nama_obat: 'Paracetamol 500mg', harga: 5000, stok: 200 },
        { nama_obat: 'Amoxicillin 500mg', harga: 15000, stok: 100 },
        { nama_obat: 'Ibuprofen 400mg', harga: 8000, stok: 150 },
        { nama_obat: 'Cetirizine 10mg', harga: 10000, stok: 120 },
        { nama_obat: 'Antasida Doen', harga: 4000, stok: 180 }
      ];
      await supabase.from('obat').insert(defaultObats);

      // G. Seed Tindakan Awal
      const defaultTindakans = [
        { nama_tindakan: 'Pemeriksaan Umum', tarif: 50000 },
        { nama_tindakan: 'Nebulizer', tarif: 75000 },
        { nama_tindakan: 'Pembersihan Karang Gigi (Scaling)', tarif: 150000 },
        { nama_tindakan: 'Pencabutan Gigi', tarif: 120000 },
        { nama_tindakan: 'Imunisasi Anak', tarif: 90000 },
        { nama_tindakan: 'USG Kandungan', tarif: 200000 }
      ];
      await supabase.from('tindakan').insert(defaultTindakans);

      console.log('Berhasil mengunggah data seed klinik ke Supabase cloud!');
    } catch (e) {
      console.error('Error seeding data automatically:', e);
    }
  },

  // Generic helper to get raw states
  async getRawData() {
    if (isSupabaseConfigured && supabase) {
      try {
        // Try auto-seeding if empty
        await this.seedSupabaseIfNeeded();

        const [
          pasienRes,
          dokterRes,
          poliRes,
          jadwalRes,
          kunjunganRes,
          rekamRes,
          obatRes,
          tindakanRes
        ] = await Promise.all([
          supabase.from('pasien').select('*').then(r=>r, (err) => ({ data: [], error: err })),
          supabase.from('dokter').select('*').then(r=>r, (err) => ({ data: [], error: err })),
          supabase.from('poli').select('*').then(r=>r, (err) => ({ data: [], error: err })),
          supabase.from('jadwal_dokter').select('*').then(r=>r, (err) => ({ data: [], error: err })),
          supabase.from('kunjungan').select('*').then(r=>r, (err) => ({ data: [], error: err })),
          supabase.from('rekam_medis').select('*').then(r=>r, (err) => ({ data: [], error: err })),
          supabase.from('obat').select('*').then(r=>r, (err) => ({ data: [], error: err })),
          supabase.from('tindakan').select('*').then(r=>r, (err) => ({ data: [], error: err }))
        ]);

        // Capture missing tables schema flag manually
        const pgError = pasienRes.error || dokterRes.error || poliRes.error || kunjunganRes.error;
        if (pgError && (pgError.code === '42P01' || pgError.message?.includes('does not exist'))) {
          (window as any).isSupabaseSchemaMissing = true;
          console.warn('Supabase DB schema tables missing. Need schema initialization SQL script.');
        } else {
          (window as any).isSupabaseSchemaMissing = false;
        }

        return {
          pasien: pasienRes.data || [],
          dokter: dokterRes.data || [],
          poli: poliRes.data || [],
          jadwal: jadwalRes.data || [],
          kunjungan: kunjunganRes.data || [],
          rekamMedis: rekamRes.data || [],
          obat: obatRes.data && obatRes.data.length > 0 ? obatRes.data : getLocalStorageItem<Obat>('klinik_obat', SEED_OBAT),
          tindakan: tindakanRes.data && tindakanRes.data.length > 0 ? tindakanRes.data : getLocalStorageItem<Tindakan>('klinik_tindakan', SEED_TINDAKAN)
        };
      } catch (error: any) {
        console.error('Gagal mengambil data dari Supabase, beralih ke Lokal:', error);
      }
    }

    // Default to Local Storage
    return {
      pasien: getLocalStorageItem<Pasien>('klinik_pasien', SEED_PASIEN),
      dokter: getLocalStorageItem<Dokter>('klinik_dokter', SEED_DOKTER),
      poli: getLocalStorageItem<Poli>('klinik_poli', SEED_POLI),
      jadwal: getLocalStorageItem<JadwalDokter>('klinik_jadwal', SEED_JADWAL),
      kunjungan: getLocalStorageItem<Kunjungan>('klinik_kunjungan', SEED_KUNJUNGAN),
      rekamMedis: getLocalStorageItem<RekamMedis>('klinik_rekam', SEED_REKAM_MEDIS),
      obat: getLocalStorageItem<Obat>('klinik_obat', SEED_OBAT),
      tindakan: getLocalStorageItem<Tindakan>('klinik_tindakan', SEED_TINDAKAN)
    };
  },

  // RESET LOCAL STORAGE
  resetLocalDatabase() {
    localStorage.removeItem('klinik_pasien');
    localStorage.removeItem('klinik_dokter');
    localStorage.removeItem('klinik_poli');
    localStorage.removeItem('klinik_jadwal');
    localStorage.removeItem('klinik_kunjungan');
    localStorage.removeItem('klinik_rekam');
    localStorage.removeItem('klinik_obat');
    localStorage.removeItem('klinik_tindakan');
    localStorage.removeItem('klinik_resep_obat');
    localStorage.removeItem('klinik_tindakan_pasien');
    window.location.reload();
  },

  // ------------------------------------------
  // 1. OPERATIONS: PASIEN
  // ------------------------------------------
  async getPasien(): Promise<Pasien[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('pasien').select('*').order('nama', { ascending: true });
      if (!error && data) return data as Pasien[];
    }
    const list = getLocalStorageItem<Pasien>('klinik_pasien', SEED_PASIEN);
    return list.sort((a, b) => a.nama.localeCompare(b.nama));
  },

  async addPasien(pasien: Omit<Pasien, 'id_pasien'>): Promise<Pasien> {
    const id = isSupabaseConfigured ? undefined : `p-${Date.now()}`;
    const newPasien = { ...pasien, id_pasien: id } as Pasien;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('pasien').insert([pasien]).select().single();
      if (!error && data) return data as Pasien;
      console.error('Supabase error:', error);
    }

    // Local Storage operation
    const list = getLocalStorageItem<Pasien>('klinik_pasien', SEED_PASIEN);
    list.push(newPasien);
    setLocalStorageItem('klinik_pasien', list);
    return newPasien;
  },

  async updatePasien(id: string, updated: Partial<Pasien>): Promise<Pasien> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('pasien').update(updated).eq('id_pasien', id).select().single();
      if (!error && data) return data as Pasien;
    }

    const list = getLocalStorageItem<Pasien>('klinik_pasien', SEED_PASIEN);
    const index = list.findIndex(p => p.id_pasien === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updated };
      setLocalStorageItem('klinik_pasien', list);
      return list[index];
    }
    throw new Error('Pasien tidak ditemukan');
  },

  async deletePasien(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('pasien').delete().eq('id_pasien', id);
      if (!error) return true;
    }

    const list = getLocalStorageItem<Pasien>('klinik_pasien', SEED_PASIEN);
    const filtered = list.filter(p => p.id_pasien !== id);
    setLocalStorageItem('klinik_pasien', filtered);

    // Cascade delete kunjungan & rekam medis locally
    const kunjunganList = getLocalStorageItem<Kunjungan>('klinik_kunjungan', SEED_KUNJUNGAN);
    const kunjunganToDelete = kunjunganList.filter(k => k.id_pasien === id);
    const kunjunganIds = kunjunganToDelete.map(k => k.id_kunjungan);
    
    setLocalStorageItem('klinik_kunjungan', kunjunganList.filter(k => k.id_pasien !== id));
    
    const rekamList = getLocalStorageItem<RekamMedis>('klinik_rekam', SEED_REKAM_MEDIS);
    setLocalStorageItem('klinik_rekam', rekamList.filter(rm => !kunjunganIds.includes(rm.id_kunjungan)));

    return true;
  },

  // ------------------------------------------
  // 2. OPERATIONS: DOKTER
  // ------------------------------------------
  async getDokter(): Promise<Dokter[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('dokter').select('*').order('nama_dokter', { ascending: true });
      if (!error && data) return data as Dokter[];
    }
    const list = getLocalStorageItem<Dokter>('klinik_dokter', SEED_DOKTER);
    return list.sort((a, b) => a.nama_dokter.localeCompare(b.nama_dokter));
  },

  async addDokter(dokter: Omit<Dokter, 'id_dokter'>): Promise<Dokter> {
    const id = isSupabaseConfigured ? undefined : `d-${Date.now()}`;
    const newDokter = { ...dokter, id_dokter: id } as Dokter;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('dokter').insert([dokter]).select().single();
      if (!error && data) return data as Dokter;
    }

    const list = getLocalStorageItem<Dokter>('klinik_dokter', SEED_DOKTER);
    list.push(newDokter);
    setLocalStorageItem('klinik_dokter', list);
    return newDokter;
  },

  async deleteDokter(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('dokter').delete().eq('id_dokter', id);
      if (!error) return true;
    }

    // Local Storage operation
    const list = getLocalStorageItem<Dokter>('klinik_dokter', SEED_DOKTER);
    setLocalStorageItem('klinik_dokter', list.filter(d => d.id_dokter !== id));

    // Cascade delete jadwal
    const jadwalList = getLocalStorageItem<JadwalDokter>('klinik_jadwal', SEED_JADWAL);
    const jadwalToDelete = jadwalList.filter(j => j.id_dokter === id);
    const jadwalIds = jadwalToDelete.map(j => j.id_jadwal);
    setLocalStorageItem('klinik_jadwal', jadwalList.filter(j => j.id_dokter !== id));

    // Cascade delete kunjungan & rekam medis related to those schedules
    const kunjunganList = getLocalStorageItem<Kunjungan>('klinik_kunjungan', SEED_KUNJUNGAN);
    const kunjunganToDelete = kunjunganList.filter(k => jadwalIds.includes(k.id_jadwal));
    const kunjunganIds = kunjunganToDelete.map(k => k.id_kunjungan);
    setLocalStorageItem('klinik_kunjungan', kunjunganList.filter(k => !jadwalIds.includes(k.id_jadwal)));

    const rekamList = getLocalStorageItem<RekamMedis>('klinik_rekam', SEED_REKAM_MEDIS);
    setLocalStorageItem('klinik_rekam', rekamList.filter(rm => !kunjunganIds.includes(rm.id_kunjungan)));

    return true;
  },

  // ------------------------------------------
  // 3. OPERATIONS: POLI
  // ------------------------------------------
  async getPoli(): Promise<Poli[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('poli').select('*').order('nama_poli', { ascending: true });
      if (!error && data) return data as Poli[];
    }
    return getLocalStorageItem<Poli>('klinik_poli', SEED_POLI).sort((a, b) => a.nama_poli.localeCompare(b.nama_poli));
  },

  async addPoli(poli: Omit<Poli, 'id_poli'>): Promise<Poli> {
    const id = isSupabaseConfigured ? undefined : `po-${Date.now()}`;
    const newPoli = { ...poli, id_poli: id } as Poli;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('poli').insert([poli]).select().single();
      if (!error && data) return data as Poli;
    }

    const list = getLocalStorageItem<Poli>('klinik_poli', SEED_POLI);
    list.push(newPoli);
    setLocalStorageItem('klinik_poli', list);
    return newPoli;
  },

  async deletePoli(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('poli').delete().eq('id_poli', id);
      if (!error) return true;
    }

    const list = getLocalStorageItem<Poli>('klinik_poli', SEED_POLI);
    setLocalStorageItem('klinik_poli', list.filter(p => p.id_poli !== id));

    // Cascade delete jadwal
    const jadwalList = getLocalStorageItem<JadwalDokter>('klinik_jadwal', SEED_JADWAL);
    const jadwalToDelete = jadwalList.filter(j => j.id_poli === id);
    const jadwalIds = jadwalToDelete.map(j => j.id_jadwal);
    setLocalStorageItem('klinik_jadwal', jadwalList.filter(j => j.id_poli !== id));

    // Cascade delete kunjungan & rekam medis
    const kunjunganList = getLocalStorageItem<Kunjungan>('klinik_kunjungan', SEED_KUNJUNGAN);
    const kunjunganToDelete = kunjunganList.filter(k => jadwalIds.includes(k.id_jadwal));
    const kunjunganIds = kunjunganToDelete.map(k => k.id_kunjungan);
    setLocalStorageItem('klinik_kunjungan', kunjunganList.filter(k => !jadwalIds.includes(k.id_jadwal)));

    const rekamList = getLocalStorageItem<RekamMedis>('klinik_rekam', SEED_REKAM_MEDIS);
    setLocalStorageItem('klinik_rekam', rekamList.filter(rm => !kunjunganIds.includes(rm.id_kunjungan)));

    return true;
  },

  // ------------------------------------------
  // 4. OPERATIONS: JADWAL DOKTER
  // ------------------------------------------
  async getJadwalDokter(): Promise<JadwalWithDetails[]> {
    const raw = await this.getRawData();
    
    return raw.jadwal.map(jad => {
      const dokter = raw.dokter.find(d => d.id_dokter === jad.id_dokter);
      const poli = raw.poli.find(p => p.id_poli === jad.id_poli);
      return {
        ...jad,
        dokter,
        poli
      };
    });
  },

  async addJadwalDokter(jadwal: Omit<JadwalDokter, 'id_jadwal'>): Promise<JadwalDokter> {
    const id = isSupabaseConfigured ? undefined : `j-${Date.now()}`;
    const newJadwal = { ...jadwal, id_jadwal: id } as JadwalDokter;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('jadwal_dokter').insert([jadwal]).select().single();
      if (!error && data) return data as JadwalDokter;
    }

    const list = getLocalStorageItem<JadwalDokter>('klinik_jadwal', SEED_JADWAL);
    list.push(newJadwal);
    setLocalStorageItem('klinik_jadwal', list);
    return newJadwal;
  },

  async deleteJadwalDokter(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('jadwal_dokter').delete().eq('id_jadwal', id);
      if (!error) return true;
    }

    const list = getLocalStorageItem<JadwalDokter>('klinik_jadwal', SEED_JADWAL);
    setLocalStorageItem('klinik_jadwal', list.filter(j => j.id_jadwal !== id));

    // Cascade delete kunjungan & rekam medis related to this schedule
    const kunjunganList = getLocalStorageItem<Kunjungan>('klinik_kunjungan', SEED_KUNJUNGAN);
    const kunjunganToDelete = kunjunganList.filter(k => k.id_jadwal === id);
    const kunjunganIds = kunjunganToDelete.map(k => k.id_kunjungan);
    setLocalStorageItem('klinik_kunjungan', kunjunganList.filter(k => k.id_jadwal !== id));

    const rekamList = getLocalStorageItem<RekamMedis>('klinik_rekam', SEED_REKAM_MEDIS);
    setLocalStorageItem('klinik_rekam', rekamList.filter(rm => !kunjunganIds.includes(rm.id_kunjungan)));

    return true;
  },

  // ------------------------------------------
  // 5. OPERATIONS: KUNJUNGAN & REGISTRASI
  // ------------------------------------------
  async getKunjungan(): Promise<KunjunganWithDetails[]> {
    const raw = await this.getRawData();
    const jadwalWithDetails = await this.getJadwalDokter();

    return raw.kunjungan.map(kun => {
      const pasien = raw.pasien.find(p => p.id_pasien === kun.id_pasien);
      const jadwal = jadwalWithDetails.find(j => j.id_jadwal === kun.id_jadwal);
      const rekamMedis = raw.rekamMedis.find(r => r.id_kunjungan === kun.id_kunjungan);

      return {
        ...kun,
        pasien,
        jadwal,
        rekamMedis
      };
    }).sort((a, b) => new Date(b.tanggal_kunjungan).getTime() - new Date(a.tanggal_kunjungan).getTime());
  },

  async addKunjungan(kunjungan: Omit<Kunjungan, 'id_kunjungan'>): Promise<Kunjungan> {
    const id = isSupabaseConfigured ? undefined : `k-${Date.now()}`;
    const newKunjungan = { ...kunjungan, id_kunjungan: id } as Kunjungan;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('kunjungan').insert([kunjungan]).select().single();
      if (!error && data) return data as Kunjungan;
    }

    const list = getLocalStorageItem<Kunjungan>('klinik_kunjungan', SEED_KUNJUNGAN);
    list.push(newKunjungan);
    setLocalStorageItem('klinik_kunjungan', list);
    return newKunjungan;
  },

  async updateKunjunganStatus(id: string, status: 'menunggu' | 'selesai'): Promise<Kunjungan> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('kunjungan').update({ status }).eq('id_kunjungan', id).select().single();
      if (!error && data) return data as Kunjungan;
    }

    const list = getLocalStorageItem<Kunjungan>('klinik_kunjungan', SEED_KUNJUNGAN);
    const index = list.findIndex(k => k.id_kunjungan === id);
    if (index !== -1) {
      list[index].status = status;
      setLocalStorageItem('klinik_kunjungan', list);
      return list[index];
    }
    throw new Error('Kunjungan tidak ditemukan');
  },

  async deleteKunjungan(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('kunjungan').delete().eq('id_kunjungan', id);
      if (!error) return true;
    }

    const list = getLocalStorageItem<Kunjungan>('klinik_kunjungan', SEED_KUNJUNGAN);
    setLocalStorageItem('klinik_kunjungan', list.filter(k => k.id_kunjungan !== id));

    // Cascade delete rekam medis
    const rekamList = getLocalStorageItem<RekamMedis>('klinik_rekam', SEED_REKAM_MEDIS);
    setLocalStorageItem('klinik_rekam', rekamList.filter(rm => rm.id_kunjungan !== id));

    return true;
  },

  // ------------------------------------------
  // 6. OPERATIONS: REKAM MEDIS
  // ------------------------------------------
  async getRekamMedis(): Promise<RekamMedisWithDetails[]> {
    const raw = await this.getRawData();
    const kunjunganWithDetails = await this.getKunjungan();

    let resepObatRaw: ResepObat[] = [];
    let tindakanPasienRaw: TindakanPasien[] = [];
    let obatRaw: Obat[] = [];
    let tindakanRaw: Tindakan[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const [ro, tp, ob, tin] = await Promise.all([
          supabase.from('resep_obat').select('*').then(r=>r, ()=>({data:[]})),
          supabase.from('tindakan_pasien').select('*').then(r=>r, ()=>({data:[]})),
          supabase.from('obat').select('*').then(r=>r, ()=>({data:[]})),
          supabase.from('tindakan').select('*').then(r=>r, ()=>({data:[]}))
        ]);
        resepObatRaw = ro.data || [];
        tindakanPasienRaw = tp.data || [];
        obatRaw = ob.data || [];
        tindakanRaw = tin.data || [];
      } catch (e) {
        console.error('Failed to query sub rekam elements in Supabase, using local:', e);
        resepObatRaw = getLocalStorageItem<ResepObat>('klinik_resep_obat', SEED_RESEP_OBAT);
        tindakanPasienRaw = getLocalStorageItem<TindakanPasien>('klinik_tindakan_pasien', SEED_TINDAKAN_PASIEN);
        obatRaw = raw.obat;
        tindakanRaw = raw.tindakan;
      }
    } else {
      resepObatRaw = getLocalStorageItem<ResepObat>('klinik_resep_obat', SEED_RESEP_OBAT);
      tindakanPasienRaw = getLocalStorageItem<TindakanPasien>('klinik_tindakan_pasien', SEED_TINDAKAN_PASIEN);
      obatRaw = raw.obat;
      tindakanRaw = raw.tindakan;
    }

    return raw.rekamMedis.map(rm => {
      const kunjungan = kunjunganWithDetails.find(k => k.id_kunjungan === rm.id_kunjungan);
      
      const relatedResep = resepObatRaw
        .filter(ro => ro.id_rekam === rm.id_rekam)
        .map(ro => {
          const obat = obatRaw.find(o => o.id_obat === ro.id_obat);
          return { ...ro, obat };
        });

      const relatedTindakan = tindakanPasienRaw
        .filter(tp => tp.id_rekam === rm.id_rekam)
        .map(tp => {
          const tindakanObj = tindakanRaw.find(t => t.id_tindakan === tp.id_tindakan);
          return { ...tp, tindakan: tindakanObj };
        });

      return {
        ...rm,
        kunjungan,
        resepObatList: relatedResep,
        tindakanPasienList: relatedTindakan
      };
    });
  },

  async addRekamMedis(rekam: Omit<RekamMedis, 'id_rekam'>): Promise<RekamMedis> {
    const id = isSupabaseConfigured ? undefined : `rm-${Date.now()}`;
    const newRekam = { ...rekam, id_rekam: id } as RekamMedis;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('rekam_medis').insert([rekam]).select().single();
      if (!error && data) {
        await this.updateKunjunganStatus(rekam.id_kunjungan, 'selesai');
        return data as RekamMedis;
      }
    }

    const list = getLocalStorageItem<RekamMedis>('klinik_rekam', SEED_REKAM_MEDIS);
    list.push(newRekam);
    setLocalStorageItem('klinik_rekam', list);

    // Also auto-mark the Kunjungan status as 'selesai' when recording their chart!
    await this.updateKunjunganStatus(rekam.id_kunjungan, 'selesai');

    return newRekam;
  },

  async addRekamMedisWithSubTables(
    rekam: Omit<RekamMedis, 'id_rekam'>,
    selectedObatItems: { id_obat: string; jumlah: number; aturan_pakai: string }[],
    selectedTindakanIds: string[]
  ): Promise<RekamMedis> {
    const rawAdded = await this.addRekamMedis(rekam);
    const rekamId = rawAdded.id_rekam;

    // Construct resep_obat list
    const resepObatListToInsert = selectedObatItems.map(item => {
      const idResep = isSupabaseConfigured ? undefined : `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      return {
        id_resep: idResep,
        id_rekam: rekamId,
        id_obat: item.id_obat,
        jumlah: item.jumlah,
        aturan_pakai: item.aturan_pakai
      } as ResepObat;
    });

    // Construct tindakan_pasien list
    const tindakanPasienListToInsert = selectedTindakanIds.map(tId => {
      const idTp = isSupabaseConfigured ? undefined : `tp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      return {
        id_tindakan_pasien: idTp,
        id_rekam: rekamId,
        id_tindakan: tId
      } as TindakanPasien;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        if (resepObatListToInsert.length > 0) {
          const cleanResep = resepObatListToInsert.map(({ id_resep, ...rest }) => rest);
          await supabase.from('resep_obat').insert(cleanResep);
        }
        if (tindakanPasienListToInsert.length > 0) {
          const cleanTp = tindakanPasienListToInsert.map(({ id_tindakan_pasien, ...rest }) => rest);
          await supabase.from('tindakan_pasien').insert(cleanTp);
        }
      } catch (e) {
        console.error('Failed to bulk insert to Supabase, continuing locally', e);
      }
    }

    // Save locally for fallback/offline/demo
    const currentResep = getLocalStorageItem<ResepObat>('klinik_resep_obat', SEED_RESEP_OBAT);
    currentResep.push(...resepObatListToInsert);
    setLocalStorageItem('klinik_resep_obat', currentResep);

    const currentTp = getLocalStorageItem<TindakanPasien>('klinik_tindakan_pasien', SEED_TINDAKAN_PASIEN);
    currentTp.push(...tindakanPasienListToInsert);
    setLocalStorageItem('klinik_tindakan_pasien', currentTp);

    // Stock reduction locally & Supabase
    const obatList = getLocalStorageItem<Obat>('klinik_obat', SEED_OBAT);
    for (const item of selectedObatItems) {
      const idx = obatList.findIndex(o => o.id_obat === item.id_obat);
      if (idx !== -1) {
        obatList[idx].stok = Math.max(0, obatList[idx].stok - item.jumlah);
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('obat').update({ stok: obatList[idx].stok }).eq('id_obat', item.id_obat);
          } catch(e) { console.error('Stock decrement Supabase failed', e); }
        }
      }
    }
    setLocalStorageItem('klinik_obat', obatList);

    return rawAdded;
  },

  async deleteRekamMedis(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('rekam_medis').delete().eq('id_rekam', id);
      if (!error) return true;
    }

    const list = getLocalStorageItem<RekamMedis>('klinik_rekam', SEED_REKAM_MEDIS);
    setLocalStorageItem('klinik_rekam', list.filter(r => r.id_rekam !== id));
    
    // Also cleanup cascaded sub-tables locally
    const currentResep = getLocalStorageItem<ResepObat>('klinik_resep_obat', SEED_RESEP_OBAT);
    setLocalStorageItem('klinik_resep_obat', currentResep.filter(ro => ro.id_rekam !== id));

    const currentTp = getLocalStorageItem<TindakanPasien>('klinik_tindakan_pasien', SEED_TINDAKAN_PASIEN);
    setLocalStorageItem('klinik_tindakan_pasien', currentTp.filter(tp => tp.id_rekam !== id));

    return true;
  },

  // ------------------------------------------
  // 7. OPERATIONS: OBAT
  // ------------------------------------------
  async getObat(): Promise<Obat[]> {
    const raw = await this.getRawData();
    return raw.obat.sort((a, b) => a.nama_obat.localeCompare(b.nama_obat));
  },

  async addObat(obat: Omit<Obat, 'id_obat'>): Promise<Obat> {
    const id = isSupabaseConfigured ? undefined : `ob-${Date.now()}`;
    const newObat = { ...obat, id_obat: id } as Obat;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('obat').insert([obat]).select().single();
        if (!error && data) return data as Obat;
      } catch (e) { console.error(e); }
    }

    const list = getLocalStorageItem<Obat>('klinik_obat', SEED_OBAT);
    list.push(newObat);
    setLocalStorageItem('klinik_obat', list);
    return newObat;
  },

  async updateObat(id: string, updated: Partial<Obat>): Promise<Obat> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('obat').update(updated).eq('id_obat', id).select().single();
        if (!error && data) return data as Obat;
      } catch (e) { console.error(e); }
    }

    const list = getLocalStorageItem<Obat>('klinik_obat', SEED_OBAT);
    const idx = list.findIndex(o => o.id_obat === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updated };
      setLocalStorageItem('klinik_obat', list);
      return list[idx];
    }
    throw new Error('Obat tidak ditemukan');
  },

  async deleteObat(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('obat').delete().eq('id_obat', id);
      } catch (e) { console.error(e); }
    }

    const list = getLocalStorageItem<Obat>('klinik_obat', SEED_OBAT);
    setLocalStorageItem('klinik_obat', list.filter(o => o.id_obat !== id));
    return true;
  },

  // ------------------------------------------
  // 8. OPERATIONS: TINDAKAN
  // ------------------------------------------
  async getTindakan(): Promise<Tindakan[]> {
    const raw = await this.getRawData();
    return raw.tindakan.sort((a, b) => a.nama_tindakan.localeCompare(b.nama_tindakan));
  },

  async addTindakan(tindakan: Omit<Tindakan, 'id_tindakan'>): Promise<Tindakan> {
    const id = isSupabaseConfigured ? undefined : `tin-${Date.now()}`;
    const newTindakan = { ...tindakan, id_tindakan: id } as Tindakan;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('tindakan').insert([tindakan]).select().single();
        if (!error && data) return data as Tindakan;
      } catch (e) { console.error(e); }
    }

    const list = getLocalStorageItem<Tindakan>('klinik_tindakan', SEED_TINDAKAN);
    list.push(newTindakan);
    setLocalStorageItem('klinik_tindakan', list);
    return newTindakan;
  },

  async updateTindakan(id: string, updated: Partial<Tindakan>): Promise<Tindakan> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('tindakan').update(updated).eq('id_tindakan', id).select().single();
        if (!error && data) return data as Tindakan;
      } catch (e) { console.error(e); }
    }

    const list = getLocalStorageItem<Tindakan>('klinik_tindakan', SEED_TINDAKAN);
    const idx = list.findIndex(t => t.id_tindakan === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updated };
      setLocalStorageItem('klinik_tindakan', list);
      return list[idx];
    }
    throw new Error('Tindakan tidak ditemukan');
  },

  async deleteTindakan(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tindakan').delete().eq('id_tindakan', id);
      } catch (e) { console.error(e); }
    }

    const list = getLocalStorageItem<Tindakan>('klinik_tindakan', SEED_TINDAKAN);
    setLocalStorageItem('klinik_tindakan', list.filter(t => t.id_tindakan !== id));
    return true;
  }
};

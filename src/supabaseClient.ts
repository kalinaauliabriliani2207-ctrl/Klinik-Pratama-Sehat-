/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://vwliidiilfzngevyturz.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xYsL0j5WjuWkLKEnXkZlQQ_SZ2QyVDE';

// Verify if credentials are valid and not placeholders
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * SQL Schema script to be placed in Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- SKEMA DATABASE HOSPITAL MANAGEMENT SYSTEM
-- ==========================================

-- 1. Tabel Pasien
CREATE TABLE IF NOT EXISTS pasien (
    id_pasien VARCHAR(255) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    jenis_kelamin VARCHAR(50) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')) NOT NULL,
    tgl_lahir DATE NOT NULL,
    alamat TEXT NOT NULL,
    no_hp VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Dokter
CREATE TABLE IF NOT EXISTS dokter (
    id_dokter VARCHAR(255) PRIMARY KEY,
    nama_dokter VARCHAR(255) NOT NULL,
    spesialis VARCHAR(255) NOT NULL,
    no_hp VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Poli / Departemen
CREATE TABLE IF NOT EXISTS poli (
    id_poli UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_poli VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Jadwal Dokter (Relasi M:N Dokter & Poli)
CREATE TABLE IF NOT EXISTS jadwal_dokter (
    id_jadwal UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_dokter VARCHAR(255) REFERENCES dokter(id_dokter) ON DELETE CASCADE NOT NULL,
    id_poli UUID REFERENCES poli(id_poli) ON DELETE CASCADE NOT NULL,
    hari VARCHAR(50) NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel Kunjungan / Registrasi Pasien (Daftar Berobat)
CREATE TABLE IF NOT EXISTS kunjungan (
    id_kunjungan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pasien VARCHAR(255) REFERENCES pasien(id_pasien) ON DELETE CASCADE NOT NULL,
    id_jadwal UUID REFERENCES jadwal_dokter(id_jadwal) ON DELETE CASCADE NOT NULL,
    tanggal_kunjungan DATE NOT NULL DEFAULT CURRENT_DATE,
    keluhan TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('menunggu', 'selesai')) DEFAULT 'menunggu' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabel Rekam Medis (Relasi 1:1 dengan Kunjungan)
CREATE TABLE IF NOT EXISTS rekam_medis (
    id_rekam UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kunjungan UUID REFERENCES kunjungan(id_kunjungan) ON DELETE CASCADE UNIQUE NOT NULL,
    diagnosa TEXT NOT NULL,
    tindakan TEXT NOT NULL,
    resep TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabel Obat
CREATE TABLE IF NOT EXISTS obat (
    id_obat VARCHAR(255) PRIMARY KEY,
    nama_obat VARCHAR(255) UNIQUE NOT NULL,
    harga INT NOT NULL,
    stok INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabel Tindakan
CREATE TABLE IF NOT EXISTS tindakan (
    id_tindakan VARCHAR(255) PRIMARY KEY,
    nama_tindakan VARCHAR(255) UNIQUE NOT NULL,
    tarif INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Tabel Resep Obat (Relasi M:N antara Rekam Medis & Obat)
CREATE TABLE IF NOT EXISTS resep_obat (
    id_resep UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_rekam UUID REFERENCES rekam_medis(id_rekam) ON DELETE CASCADE NOT NULL,
    id_obat VARCHAR(255) REFERENCES obat(id_obat) ON DELETE CASCADE NOT NULL,
    jumlah INT NOT NULL,
    aturan_pakai TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tabel Tindakan Pasien (Relasi M:N antara Rekam Medis & Tindakan)
CREATE TABLE IF NOT EXISTS tindakan_pasien (
    id_tindakan_pasien UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_rekam UUID REFERENCES rekam_medis(id_rekam) ON DELETE CASCADE NOT NULL,
    id_tindakan VARCHAR(255) REFERENCES tindakan(id_tindakan) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- DATA CONTOH AWAL (SEED DATA)
-- ==========================================

-- Data Poli
INSERT INTO poli (nama_poli) VALUES 
('Gigi & Mulut'), 
('Penyakit Dalam'), 
('Anak & Tumbuh Kembang'), 
('Kandungan (OBGYN)'),
('Umum')
ON CONFLICT (nama_poli) DO NOTHING;

-- Data Dokter
INSERT INTO dokter (nama_dokter, spesialis, no_hp) VALUES
('Dr. Bambang Setiadi, Sp.PD', 'Penyakit Dalam', '081234567801'),
('Dr. Clara Amalia, Sp.A', 'Dokter Anak', '081234567802'),
('Drg. Faisal Haris', 'Dokter Gigi', '081234567803'),
('Dr. Lestari Astuti, Sp.OG', 'Kandungan', '081234567804'),
('Dr. Denny Pratama', 'Umum', '081234567805')
ON CONFLICT DO NOTHING;

-- Data Pasien
INSERT INTO pasien (nama, jenis_kelamin, tgl_lahir, alamat, no_hp) VALUES
('Budi Santoso', 'Laki-laki', '1988-04-12', 'Jl. Merdeka No. 45, Purwokerto', '085712345671'),
('Siti Aminah', 'Perempuan', '1995-11-23', 'Jl. Sudirman Gg. Melati No. 8', '085712345672'),
('Andi Wijaya', 'Laki-laki', '2010-01-05', 'Perumahan Soka Indah Blok C/3', '085712345673'),
('Dewi Lestari', 'Perempuan', '1992-08-30', 'Jl. Ahmad Yani No. 12', '085712345674')
ON CONFLICT DO NOTHING;

-- Data Obat
INSERT INTO obat (nama_obat, harga, stok) VALUES
('Paracetamol 500mg', 5000, 200),
('Amoxicillin 500mg', 15000, 100),
('Ibuprofen 400mg', 8000, 150),
('Cetirizine 10mg', 10000, 120),
('Antasida Doen', 4000, 180)
ON CONFLICT (nama_obat) DO NOTHING;

-- Data Tindakan
INSERT INTO tindakan (nama_tindakan, tarif) VALUES
('Pemeriksaan Umum', 50000),
('Nebulizer', 75000),
('Pembersihan Karang Gigi (Scaling)', 150000),
('Pencabutan Gigi', 120000),
('Imunisasi Anak', 90000),
('USG Kandungan', 200000)
ON CONFLICT (nama_tindakan) DO NOTHING;


-- ==========================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS) - Opsional
-- Supaya bisa dibaca oleh publik jika menggunakan API Client Tanpa Auth
-- ==========================================

ALTER TABLE pasien ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokter ENABLE ROW LEVEL SECURITY;
ALTER TABLE poli ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_dokter ENABLE ROW LEVEL SECURITY;
ALTER TABLE kunjungan ENABLE ROW LEVEL SECURITY;
ALTER TABLE rekam_medis ENABLE ROW LEVEL SECURITY;
ALTER TABLE obat ENABLE ROW LEVEL SECURITY;
ALTER TABLE tindakan ENABLE ROW LEVEL SECURITY;
ALTER TABLE resep_obat ENABLE ROW LEVEL SECURITY;
ALTER TABLE tindakan_pasien ENABLE ROW LEVEL SECURITY;

-- Buat policy bypass agar anon client bisa Read/Write untuk demo ini
CREATE POLICY "Allow public read/write" ON pasien FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON dokter FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON poli FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON jadwal_dokter FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON kunjungan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON rekam_medis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON obat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON tindakan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON resep_obat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON tindakan_pasien FOR ALL USING (true) WITH CHECK (true);
`;

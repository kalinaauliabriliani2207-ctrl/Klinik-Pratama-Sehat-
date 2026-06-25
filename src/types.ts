/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Pasien {
  id_pasien: string; // uuid or local string id
  nama: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tgl_lahir: string; // YYYY-MM-DD
  alamat: string;
  no_hp: string;
  created_at?: string;
}

export interface Dokter {
  id_dokter: string;
  nama_dokter: string;
  spesialis: string;
  no_hp: string;
  created_at?: string;
}

export interface Poli {
  id_poli: string;
  nama_poli: string;
  created_at?: string;
}

export interface JadwalDokter {
  id_jadwal: string;
  id_dokter: string;
  id_poli: string;
  hari: string; // e.g., 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
  jam_mulai: string; // HH:MM
  jam_selesai: string; // HH:MM
  created_at?: string;
}

export interface Kunjungan {
  id_kunjungan: string;
  id_pasien: string;
  id_jadwal: string;
  tanggal_kunjungan: string; // YYYY-MM-DD
  keluhan: string;
  status: 'menunggu' | 'selesai';
  created_at?: string;
}

export interface RekamMedis {
  id_rekam: string;
  id_kunjungan: string;
  diagnosa: string;
  tindakan: string;
  resep: string;
  created_at?: string;
}

export interface Obat {
  id_obat: string;
  nama_obat: string;
  harga: number;
  stok: number;
  created_at?: string;
}

export interface ResepObat {
  id_resep: string;
  id_rekam: string;
  id_obat: string;
  jumlah: number;
  aturan_pakai: string;
  created_at?: string;
}

export interface Tindakan {
  id_tindakan: string;
  nama_tindakan: string;
  tarif: number;
  created_at?: string;
}

export interface TindakanPasien {
  id_tindakan_pasien: string;
  id_rekam: string;
  id_tindakan: string;
  created_at?: string;
}

// Joined interfaces for clean UI operations
export interface JadwalWithDetails extends JadwalDokter {
  dokter?: Dokter;
  poli?: Poli;
}

export interface KunjunganWithDetails extends Kunjungan {
  pasien?: Pasien;
  jadwal?: JadwalWithDetails;
  rekamMedis?: RekamMedisWithDetails;
}

export interface ResepObatWithDetails extends ResepObat {
  obat?: Obat;
}

export interface TindakanPasienWithDetails extends TindakanPasien {
  tindakan?: Tindakan;
}

export interface RekamMedisWithDetails extends RekamMedis {
  kunjungan?: KunjunganWithDetails;
  resepObatList?: ResepObatWithDetails[];
  tindakanPasienList?: TindakanPasienWithDetails[];
}

export interface RekamMedisSimpleWithDetails extends RekamMedis {
  kunjungan?: KunjunganWithDetails;
}

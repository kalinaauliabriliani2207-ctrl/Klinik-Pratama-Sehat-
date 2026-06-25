/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  FileText, 
  User, 
  Stethoscope, 
  Calendar, 
  Pill, 
  Activity,
  HeartPulse,
  Printer
} from 'lucide-react';
import { RekamMedisWithDetails } from '../types';

interface RekamMedisManagerProps {
  rekamMedisList: RekamMedisWithDetails[];
  onDeleteRekam: (id: string) => Promise<void>;
}

export default function RekamMedisManager({
  rekamMedisList,
  onDeleteRekam
}: RekamMedisManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRM = rekamMedisList.filter(rm => {
    const rawSearch = searchQuery.toLowerCase();
    const matchesPatient = rm.kunjungan?.pasien?.nama.toLowerCase().includes(rawSearch) || false;
    const matchesDoctor = rm.kunjungan?.jadwal?.dokter?.nama_dokter.toLowerCase().includes(rawSearch) || false;
    const matchesDiagnosa = rm.diagnosa.toLowerCase().includes(rawSearch);
    const matchesTindakan = rm.tindakan.toLowerCase().includes(rawSearch);
    const matchesResep = rm.resep.toLowerCase().includes(rawSearch);

    return matchesPatient || matchesDoctor || matchesDiagnosa || matchesTindakan || matchesResep;
  });

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Arsip Rekam Medis Pasien</h1>
          <p className="text-xs text-slate-500">
            Daftar lengkap riwayat diagnosa klinis, terapi tindakan medis, dan rujukan resep obat (e-Prescription)
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition"
          title="Cetak Laporan Medis"
        >
          <Printer className="h-4 w-4 text-slate-500" />
          Cetak Arsip Medis
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
        <input
          id="input-cari-rekam-medis"
          type="text"
          placeholder="Ketik nama pasien, dokter spesialis, obat, atau istilah diagnosa penyakit (misal: Gastritis)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Medical Sheets Layout Render */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRM.length === 0 ? (
          <div className="md:col-span-2 text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
            <FileText className="h-11 w-11 mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Data rekam medis kosong</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tidak ditemukan kecocokan rujukan medis untuk pencarian kata kunci "{searchQuery}".
            </p>
          </div>
        ) : (
          filteredRM.map((rm) => (
            <div 
              key={rm.id_rekam}
              className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 space-y-4 hover:shadow-md hover:border-slate-200/50 transition relative overflow-hidden"
            >
              {/* Paper Folder aesthetics banner */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />

              {/* Patient header info block */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    E-Rekam Medis (RM-{rm.id_rekam.substring(0, 5)})
                  </span>
                  
                  <h3 className="text-base font-bold text-slate-800 mt-1.5 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-slate-500" />
                    {rm.kunjungan?.pasien?.nama || 'Pasien dihapus'}
                  </h3>

                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Tanggal Berobat: {rm.kunjungan?.tanggal_kunjungan 
                        ? new Date(rm.kunjungan.tanggal_kunjungan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menghapus arsip rekam medis ini? Tindakan ini tidak mengubah status denda/pendaftaran kunjungan pasien.')) {
                      onDeleteRekam(rm.id_rekam);
                    }
                  }}
                  className="p-1 px-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-700 rounded-lg transition"
                  title="Hapus Rekam Medis"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Doctor and Polyclinic sub-row */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100/40 text-[11px] text-slate-600">
                <div>
                  <span className="block font-medium text-slate-400 font-bold uppercase tracking-wider text-[9px]">Dokter Pemeriksa</span>
                  <span className="font-semibold text-blue-800 mt-0.5 block truncate">
                    {rm.kunjungan?.jadwal?.dokter?.nama_dokter || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block font-medium text-slate-400 font-bold uppercase tracking-wider text-[9px]">Poli Layanan</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block truncate">
                    {rm.kunjungan?.jadwal?.poli?.nama_poli || 'Umum'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {/* 1. DIAGNOSA */}
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <SparklesDiagnosa />
                    Diagnosa Utama
                  </h4>
                  <p className="text-xs font-semibold text-slate-800 bg-blue-50/20 px-3 py-2 rounded-xl border border-blue-100/20">
                    {rm.diagnosa}
                  </p>
                </div>

                {/* 2. TINDAKAN */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-slate-400" />
                    Penanganan & Tindakan Klinis
                  </h4>
                  
                  {/* Structured Relational Actions */}
                  {rm.tindakanPasienList && rm.tindakanPasienList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {rm.tindakanPasienList.map((tp, idx) => (
                        <div 
                          key={tp.id_tindakan_pasien || idx}
                          className="inline-flex items-center gap-1 bg-blue-50/70 border border-blue-100/60 px-2 py-0.5 rounded text-[10px] text-blue-800 font-medium"
                        >
                          <span>{tp.tindakan?.nama_tindakan || 'Tindakan'}</span>
                          {tp.tindakan?.tarif && (
                            <span className="bg-blue-600 text-white rounded-[3px] font-mono px-1 py-0.2 scale-90">
                              Rp {tp.tindakan.tarif.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed pl-3 border-l-2 border-slate-200">
                    {rm.tindakan}
                  </p>
                </div>

                {/* 3. RESEP OBAT */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5 text-slate-400" />
                    Formulasi Resep Obat (Rx)
                  </h4>

                  {/* Structured Relational Prescription Drugs */}
                  {rm.resepObatList && rm.resepObatList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {rm.resepObatList.map((ro, idx) => (
                        <div 
                          key={ro.id_resep || idx}
                          className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] border border-emerald-100 font-medium"
                        >
                          <span>{ro.obat?.nama_obat || 'Obat'}</span>
                          <span className="bg-emerald-600 text-white px-1 rounded-[3px] scale-90 font-mono">
                            {ro.jumlah} PCS
                          </span>
                          <span className="text-slate-500 italic">({ro.aturan_pakai})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="p-3 bg-amber-50/20 hover:bg-amber-50/30 transition border border-amber-100/50 rounded-xl flex items-start gap-2.5 font-mono text-[11px] text-amber-900 leading-relaxed">
                    <span className="font-bold text-amber-700 select-none">Rx:</span>
                    <span>{rm.resep}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SparklesDiagnosa() {
  return (
    <span className="text-slate-400 shrink-0">
      <HeartPulse className="h-3 w-3" />
    </span>
  );
}

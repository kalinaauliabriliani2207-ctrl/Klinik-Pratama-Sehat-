/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  PhoneCall, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Users, 
  Award, 
  Plus, 
  CheckCircle2, 
  Search,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pasien, 
  Dokter, 
  Poli, 
  JadwalWithDetails, 
  Kunjungan 
} from '../types';

interface PublicPortalProps {
  pasienList: Pasien[];
  dokterList: Dokter[];
  poliList: Poli[];
  jadwalList: JadwalWithDetails[];
  onAddPasien: (pasien: Omit<Pasien, 'id_pasien'>) => Promise<Pasien>;
  onAddKunjungan: (kunjungan: Omit<Kunjungan, 'id_kunjungan'>) => Promise<Kunjungan>;
  setActiveTab: (tab: string) => void;
}

export default function PublicPortal({
  pasienList,
  dokterList,
  poliList,
  jadwalList,
  onAddPasien,
  onAddKunjungan,
  setActiveTab
}: PublicPortalProps) {
  // Booking modal/state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [selectedPoli, setSelectedPoli] = useState('');
  const [selectedJadwal, setSelectedJadwal] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [tempPatientName, setTempPatientName] = useState('');
  const [tempPatientNik, setTempPatientNik] = useState('');
  const [tempPatientGender, setTempPatientGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [tempPatientDob, setTempPatientDob] = useState('');
  const [tempPatientPhone, setTempPatientPhone] = useState('');
  const [tempPatientAddress, setTempPatientAddress] = useState('');
  const [keluhan, setKeluhan] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().substring(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchPatientQuery, setSearchPatientQuery] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Filter schedules based on selected Poli ID
  const filteredSchedules = jadwalList.filter(j => !selectedPoli || j.id_poli === selectedPoli);

  // Quick doctor stats
  const totalDoctorsCount = dokterList.length || 12;
  const activePoliCount = poliList.length || 4;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalPatientId = selectedPatientId;

      if (isNewPatient) {
        // Form validate patients database checks
        if (!tempPatientName) {
          alert('Nama pasien harus diisi');
          setIsSubmitting(false);
          return;
        }

        // Add new patient in db callback and get back the created record with ID
        const createdPatient = await onAddPasien({
          nama: tempPatientName,
          jenis_kelamin: tempPatientGender,
          tgl_lahir: tempPatientDob || '1995-01-01',
          no_hp: tempPatientPhone || '0812345678',
          alamat: tempPatientAddress || 'Purwokerto'
        });
        
        finalPatientId = createdPatient.id_pasien;
      }

      // 2. Add kunjungan
      if (!selectedJadwal) {
        alert('Silakan pilih jadwal dokter yang aktif');
        setIsSubmitting(false);
        return;
      }

      // Execute onAddKunjungan
      await onAddKunjungan({
        id_pasien: finalPatientId || (pasienList[0]?.id_pasien || 'P-001'),
        id_jadwal: selectedJadwal,
        tanggal_kunjungan: bookingDate,
        keluhan: keluhan || 'Konsultasi rutin rawat jalan',
        status: 'menunggu'
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setShowBookingModal(false);
        // Clear forms
        setTempPatientName('');
        setTempPatientNik('');
        setKeluhan('');
        setSelectedJadwal('');
      }, 2500);

    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find dynamic doctor profile illustration/avatar
  const doctorImages = [
    '/src/assets/images/female_doctor_hero_1780543220891.png',
    '/src/assets/images/clinic_about_us_1780543237795.png'
  ];

  return (
    <div className="bg-white rounded-3xl overflow-hidden -mx-4 md:-mx-8 -my-4 md:-my-8 text-[#1E293B] relative selection:bg-blue-105 selection:text-white">
      {/* 1. HERO LANDING SECTION */}
      <section className="relative bg-gradient-to-br from-blue-50/70 via-indigo-50/20 to-white pt-10 pb-16 md:py-24 px-6 md:px-16 overflow-hidden border-b border-blue-50/50">
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-tr from-blue-100/30 to-indigo-50/30 rounded-full blur-3xl -z-10 translate-x-24 -translate-y-24" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-blue-50/20 rounded-full blur-2xl -z-10 -translate-x-12 translate-y-24" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Content */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100/80 rounded-full text-blue-600 font-semibold text-xs tracking-wide">
              <Sparkles className="h-4 w-4 animate-spin-slow text-blue-500" />
              <span>38+ Dokter Spesialis Berpengalaman</span>
            </div>

            <h1 className="text-4xl md:text-5.5xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Empowering Lives <br />
              through <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Transformative</span> <br />
              Healthcare
            </h1>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed font-normal max-w-lg">
              Misi kami adalah mendampingi setiap tahapan hidup Anda dengan pelayanan kesehatan inovatif, tulus, berbasis bukti secara komprehensif, didukung teknologi mutakhir terpercaya.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setShowBookingModal(true)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm tracking-wide shadow-lg shadow-blue-200/50 hover:shadow-blue-300/40 transition duration-150 transform hover:-translate-y-0.5 active:translate-y-0 text-center cursor-pointer"
              >
                Make Appointment
              </button>
              
              <button
                onClick={() => {
                  const el = document.getElementById('about-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-7 py-4 bg-white/80 backdrop-blur-xs hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-bold text-sm tracking-normal transition text-center cursor-pointer"
              >
                Pelajari Layanan
              </button>
            </div>

            {/* Quick Metrics stats cards */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-8 max-w-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Users className="h-5 w-5" />
                  <span className="text-xl font-extrabold text-slate-800">38+</span>
                </div>
                <p className="text-xs font-semibold text-slate-500">Experienced Doctors</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-600">
                  <Award className="h-5 w-5" />
                  <span className="text-xl font-extrabold text-slate-800">20+</span>
                </div>
                <p className="text-xs font-semibold text-slate-500">Medical Achievements</p>
              </div>
            </div>
          </div>

          {/* Right Column Image Container */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none flex justify-center">
              {/* Soft decorative background circles */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-300/10 via-indigo-200/15 to-transparent rounded-full blur-3xl -z-10" />

              {/* Main doctor crop container */}
              <div className="relative w-[340px] md:w-[380px] h-[340px] md:h-[380px] bg-gradient-to-b from-blue-100 to-indigo-50 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img 
                  src="/src/assets/images/female_doctor_hero_1780543220891.png"
                  alt="Doctor Hero"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top scale-102 transform transition duration-1000 hover:scale-[1.05]"
                />
              </div>

              {/* Floating element 1: Doctor Credentials Badge */}
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-72 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3">
                <img 
                  src="/src/assets/images/female_doctor_hero_1780543220891.png" 
                  alt="Dr Emily" 
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover border border-blue-100 shadow" 
                />
                <div className="flex-1 text-left">
                  <h4 className="text-xs font-extrabold text-slate-800">Dr. Emily Turner</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Cardiologist (Aktif Poli Umum/Jantung)</p>
                  <button 
                    onClick={() => setShowBookingModal(true)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 mt-0.5 inline-flex items-center gap-0.5"
                  >
                    Make Appointment <ArrowRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT US SECTION */}
      <section id="about-section" className="py-20 px-6 md:px-16 bg-white max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left illustration */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-50">
              <img 
                src="/src/assets/images/clinic_about_us_1780543237795.png" 
                alt="About us clinic"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center max-h-[460px]"
              />
              <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
            </div>
          </div>

          {/* Right Text details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-widest text-blue-600 font-extrabold block">About Us</span>
              <p className="text-lg md:text-xl font-bold italic text-slate-700 leading-relaxed relative pl-4 border-l-3 border-blue-500">
                "Leading healthcare institution dedicated to providing exceptional medical services and personalized care."
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vision</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To be the premier healthcare provider, recognized for our excellence in medical care, patient-centered approach, and commitment to advancing healthcare services, ultimately improving the health and well-being of our community.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Missions</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Provide exceptional and comprehensive healthcare services</span>
                </li>
                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Prioritize patient-centered care and satisfaction</span>
                </li>
                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Foster a culture of continuous learning and innovation</span>
                </li>
                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Cultivate strong partnerships and collaborations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR SERVICES */}
      <section className="bg-slate-50/50 py-20 px-6 md:px-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-[11px] uppercase tracking-widest text-blue-600 font-extrabold block">Our Services</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-930 tracking-tight">
              Comprehensive Healthcare Solutions for Your Well-being
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bento Card 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-150 transition group hover:shadow-lg duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-10 w-10 bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-xl flex items-center justify-center transition duration-150">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Primary Care</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Routine checkups, physical exams, and preventive care for individuals and families on demand.
                </p>
              </div>
              <button onClick={() => setShowBookingModal(true)} className="text-xs font-bold text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-1 mt-6 self-start">
                Daftar Sekarang <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Bento Card 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-150 transition group hover:shadow-lg duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-10 w-10 bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white rounded-xl flex items-center justify-center transition duration-150">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Specialists Medical Services</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Access a wide range of specialized medical clinical services tailored to you specifically from our senior consultants.
                </p>
              </div>
              <button onClick={() => setShowBookingModal(true)} className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700 inline-flex items-center gap-1 mt-6 self-start">
                Daftar Sekarang <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Bento Card 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-150 transition group hover:shadow-lg duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-10 w-10 bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white rounded-xl flex items-center justify-center transition duration-150">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Diagnostic Imaging</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  State-of-the-art diagnostic imaging services for accurate results mapping and instant diagnosis report propagation.
                </p>
              </div>
              <button onClick={() => setShowBookingModal(true)} className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700 inline-flex items-center gap-1 mt-6 self-start">
                Daftar Sekarang <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Bento Card 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-150 transition group hover:shadow-lg duration-150 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-10 w-10 bg-amber-50 group-hover:bg-amber-600 text-amber-600 group-hover:text-white rounded-xl flex items-center justify-center transition duration-150">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Rehabilitative Services</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Improve mobility and functionality with our expert therapies, dynamic post-surgery exercises, and premium consultation sessions.
                </p>
              </div>
              <button onClick={() => setShowBookingModal(true)} className="text-xs font-bold text-amber-600 group-hover:text-amber-700 inline-flex items-center gap-1 mt-6 self-start">
                Daftar Sekarang <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MEET OUR EXCEPTIONAL DOCTORS */}
      <section className="py-20 px-6 md:px-16 bg-white max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-[11px] uppercase tracking-widest text-blue-600 font-extrabold block">Our Doctors</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Meet Our Exceptional Doctors
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tim dokter spesialis berdedikasi tinggi dengan sertifikasi kompetensi regional yang berkomitmen memberikan asuhan medis holistik.
          </p>
        </div>

        {dokterList.length === 0 ? (
          <div className="border border-slate-100 bg-slate-50 rounded-2xl p-8 text-center max-w-md mx-auto">
            <Stethoscope className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Belum ada tenaga dokter spesialis terdaftar di sistem.</p>
            <button 
              onClick={() => setActiveTab('dokter')} 
              className="text-xs font-bold text-blue-600 mt-2 block mx-auto hover:underline"
            >
              + Daftarkan Tenaga Dokter di Konsol Admin
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dokterList.map((dr, index) => {
              // Alternate images or use default circular representation
              const imageSrc = doctorImages[index % doctorImages.length];

              return (
                <div 
                  key={dr.id_dokter} 
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-200 group text-center flex flex-col justify-between"
                >
                  <div className="p-5 flex flex-col items-center">
                    {/* Character/avatar container */}
                    <div className="h-28 w-28 rounded-full overflow-hidden bg-blue-50 border-2 border-slate-100 z-10 relative mb-4">
                      <img 
                        src={imageSrc} 
                        alt={dr.nama_dokter}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover object-top" 
                      />
                    </div>
                    
                    <h3 className="font-extrabold text-slate-800 text-sm leading-tight">{dr.nama_dokter}</h3>
                    <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide mt-1">{dr.spesialis}</p>
                    <div className="mt-3 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                      No. Hp: {dr.no_hp || '-'}
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                    <button
                      onClick={() => {
                        // Find a schedule for this doctor and booking
                        setSelectedPoli('');
                        const matchingJadwal = jadwalList.find(j => j.id_dokter === dr.id_dokter);
                        if (matchingJadwal) {
                          setSelectedJadwal(matchingJadwal.id_jadwal);
                          setSelectedPoli(matchingJadwal.id_poli);
                        }
                        setShowBookingModal(true);
                      }}
                      className="w-full py-2 bg-white hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-xs font-bold border border-blue-100 hover:border-blue-600 shadow-xs transition duration-150 cursor-pointer"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. CONTACT US BANNER */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 py-16 px-6 md:px-12 mx-6 md:mx-16 rounded-3xl text-white mb-20 shadow-xl shadow-blue-100 relative overflow-hidden">
        {/* Decorative backdrop blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-2xl -translate-x-12 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-blue-500/10 rounded-full blur-xl translate-x-12 translate-y-12" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200">Get in Touch</span>
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight leading-snug">
              Contact Us for Exceptional Care
            </h2>
            <p className="text-sm text-blue-100 max-w-xl">
              Butuh panduan pendaftaran online atau informasi detail jadwal jaga dokter primer? Tim layanan pelanggan (care line) kami siap merespons keluhan Anda secara real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center"
            >
              Make Appointment
            </button>
            <a
              href="https://wa.me/628123456789"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 bg-blue-500/25 border border-blue-400/40 hover:bg-blue-500/35 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition text-center whitespace-nowrap flex items-center justify-center gap-2"
            >
              <PhoneCall className="h-4 w-4" />
              Chat is Online
            </a>
          </div>
        </div>
      </section>

      {/* BOOKING MODAL */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 relative overflow-hidden"
            >
              {bookingSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Appointment Berhasil Dibuat!</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Data registrasi kunjungan Anda telah diverifikasi dan masuk sistem antrean periksa secara real-time. Anda bisa memantau nomor antrean di tab 'Monitor Antrean'.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingSuccess(false);
                      setShowBookingModal(false);
                      setTempPatientName('');
                      setTempPatientNik('');
                      setKeluhan('');
                      setSelectedJadwal('');
                      setActiveTab('dashboard');
                    }}
                    className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer w-full"
                  >
                    <span>Lacak Antrean Sekarang</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4 max-h-[85vh] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Booking Rawat Jalan Online</h4>
                        <p className="text-[10px] text-slate-400">Dapatkan antrean tanpa antre manual</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowBookingModal(false)} 
                      className="p-1 px-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>

                  {/* Toggle New / Existing Pasien */}
                  <div className="grid grid-cols-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsNewPatient(true)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isNewPatient ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Regis Baru
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewPatient(false)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        !isNewPatient ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Pasien Terdaftar
                    </button>
                  </div>

                  {isNewPatient ? (
                    <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">Identitas Pasien Baru</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Nama Lengkap *</label>
                          <input 
                            type="text" 
                            required={isNewPatient}
                            value={tempPatientName}
                            onChange={(e) => setTempPatientName(e.target.value)}
                            placeholder="Contoh: Aldi Prabowo"
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">NIK KTP (16 Digit) *</label>
                          <input 
                            type="text" 
                            required={isNewPatient}
                            maxLength={16}
                            value={tempPatientNik}
                            onChange={(e) => setTempPatientNik(e.target.value)}
                            placeholder="NIK 3302..."
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1 col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Tanggal Lahir *</label>
                          <input 
                            type="date" 
                            value={tempPatientDob}
                            onChange={(e) => setTempPatientDob(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Gender *</label>
                          <select 
                            value={tempPatientGender}
                            onChange={(e) => setTempPatientGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                            className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white h-[34px]"
                          >
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">No HP / WhatsApp</label>
                          <input 
                            type="tel" 
                            value={tempPatientPhone}
                            onChange={(e) => setTempPatientPhone(e.target.value)}
                            placeholder="0812..."
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Alamat Rumah</label>
                          <input 
                            type="text" 
                            value={tempPatientAddress}
                            onChange={(e) => setTempPatientAddress(e.target.value)}
                            placeholder="Purwokerto..."
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">Pilih Pasien Terdaftar</p>
                      
                      {/* Search patient searchbar picker */}
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="Cari nama pasien terdaftar..."
                          value={searchPatientQuery}
                          onChange={(e) => setSearchPatientQuery(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>

                      <div className="max-h-28 overflow-y-auto border border-slate-150 rounded-lg bg-white divide-y divide-slate-100">
                        {pasienList
                          .filter(p => !searchPatientQuery || p.nama.toLowerCase().includes(searchPatientQuery.toLowerCase()) || p.no_hp.includes(searchPatientQuery))
                          .map((p) => (
                            <button
                              key={p.id_pasien}
                              type="button"
                              onClick={() => {
                                setSelectedPatientId(p.id_pasien);
                                setSearchPatientQuery(p.nama);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between cursor-pointer ${
                                selectedPatientId === p.id_pasien ? 'bg-blue-50 font-bold text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <div>
                                <span>{p.nama}</span>
                                <span className="text-[10px] text-slate-400 font-mono block">Telp: {p.no_hp}</span>
                              </div>
                              <span className="text-[10px] uppercase font-bold text-slate-400">{p.id_pasien}</span>
                            </button>
                        ))}
                        {pasienList.filter(p => !searchPatientQuery || p.nama.toLowerCase().includes(searchPatientQuery.toLowerCase())).length === 0 && (
                          <p className="p-3 text-[11px] text-slate-400 text-center">Pasien tidak ditemukan. Gunakan tab 'Regis Baru'.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Poli / Unit Pelayanan Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Kefarmasian / Poli Unit</label>
                      <select
                        value={selectedPoli}
                        onChange={(e) => {
                          setSelectedPoli(e.target.value);
                          setSelectedJadwal('');
                        }}
                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white h-[34px]"
                      >
                        <option value="">-- Semua Poli --</option>
                        {poliList.map(po => (
                          <option key={po.id_poli} value={po.id_poli}>{po.nama_poli}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Tanggal Kunjungan</label>
                      <input 
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white h-[34px]"
                      />
                    </div>
                  </div>

                  {/* Jaga Dokter list selection dropdown */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Jadwal Tugas Dokter Spesialis *</label>
                    <select
                      required
                      value={selectedJadwal}
                      onChange={(e) => setSelectedJadwal(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="">-- Pilih Dokter & Jam Jaga --</option>
                      {filteredSchedules.map(jadwal => (
                        <option key={jadwal.id_jadwal} value={jadwal.id_jadwal}>
                          {jadwal.dokter?.nama_dokter} Jaga Poli: {jadwal.poli?.nama_poli} ({jadwal.hari}, {jadwal.jam_mulai} - {jadwal.jam_selesai})
                        </option>
                      ))}
                    </select>
                    {filteredSchedules.length === 0 && (
                      <p className="text-[10px] text-amber-600 font-medium leading-none mt-1">
                        ⚠️ Belum ada jadwal tugas dokter spesialis terdaftar untuk saringan poli ini.
                      </p>
                    )}
                  </div>

                  {/* Keluhan */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Keluhan Utama / Alasan Konsultasi</label>
                    <textarea 
                      rows={2}
                      value={keluhan}
                      onChange={(e) => setKeluhan(e.target.value)}
                      placeholder="Contoh: Sakit tenggorokan, flu, demam tinggi, sariawan..."
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md shadow-blue-100 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? 'Tunggu Sebentar...' : 'Konfirmasi & Daftarkan Antrean'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

import React, { useState } from 'react';
import {
  Globe2,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Database,
  Building,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, registerUser, isSupabaseActive } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('ceo');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setErrorMsg(result.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat proses masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name || name.trim().length < 3) {
      setErrorMsg('Nama lengkap minimal 3 karakter.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Masukkan alamat email bisnis yang valid.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter untuk keamanan.');
      return;
    }

    // Role strict check: ONLY ceo, admin, komisaris
    if (role !== 'ceo' && role !== 'admin' && role !== 'komisaris') {
      setErrorMsg('Role akses tidak valid. Hanya diizinkan: Admin, CEO, atau Komisaris.');
      return;
    }

    setIsLoading(true);

    try {
      const title =
        role === 'ceo'
          ? 'Chief Executive Officer / Direktur Utama'
          : role === 'admin'
          ? 'System & Database Administrator'
          : 'Dewan Komisaris / Board of Commissioners';

      const result = await registerUser(name, email, password, role, title);
      if (result.success) {
        setSuccessMsg(
          `Akun berhasil didaftarkan dan disimpan ke database dengan role ${role.toUpperCase()}!`
        );
      } else {
        setErrorMsg(result.message || 'Gagal mendaftarkan akun ke database.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan ke database.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-navy-950 to-slate-950 text-slate-100 p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-navy-800/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-600/15 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="bg-navy-950 px-6 py-6 border-b border-navy-900 text-center relative">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-navy-950 shadow-lg font-bold mb-3">
            <Globe2 className="h-7 w-7 text-navy-950" />
          </div>
          <h1 className="text-lg font-black text-white uppercase tracking-wider">
            PT GLOBAL EXPOR INDONESIA
          </h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wide mt-0.5">
            Enterprise Export Intelligence & Management Portal
          </p>

          <div className="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-navy-900/90 border border-navy-800 text-[11px] text-slate-300">
            <Database className="h-3 w-3 text-emerald-400" />
            <span>
              Database Auth: {isSupabaseActive ? 'Supabase PostgreSQL' : 'Enterprise Database Active'}
            </span>
          </div>
        </div>

        {/* Tab Selection: Masuk vs Daftar */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-navy-950 shadow-sm'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            Masuk Akun (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-navy-950 shadow-sm'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            Daftar Akun Baru (Register)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode 1: Login */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Perusahaan</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="globalexporindonesia@gmail.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Kata Sandi (Password)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-2"
              >
                <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            /* Mode 2: Register & Save to Database */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Lengkap & Gelar *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hansel Varian Putra"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-navy-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Resmi *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@globalexpor.id"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-navy-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Kata Sandi *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg outline-none focus:border-navy-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Strict Role Selection: ONLY CEO, Admin, Komisaris */}
              <div className="space-y-1 pt-1">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Role Akses Terbatas *</span>
                  <span className="text-[10px] text-amber-700 font-bold">Khusus Eksekutif & IT</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ceo', label: 'CEO', desc: 'Direktur Utama' },
                    { id: 'admin', label: 'Admin', desc: 'Sistem & IT' },
                    { id: 'komisaris', label: 'Komisaris', desc: 'Dewan Komisaris' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as UserRole)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        role === r.id
                          ? 'border-navy-950 bg-navy-900 text-white font-bold shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-bold block">{r.label}</span>
                      <span
                        className={`text-[9px] block ${
                          role === r.id ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {r.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 mt-3"
              >
                <Database className="h-4 w-4" />
                <span>{isLoading ? 'Menyimpan...' : 'Simpan Akun ke Database'}</span>
              </button>
            </form>
          )}


        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
          <p>© 2026 PT Global Expor Indonesia. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="text-slate-400 mt-0.5">Sistem Keamanan Berlapis & Row Level Security (RLS)</p>
        </div>
      </div>
    </div>
  );
};

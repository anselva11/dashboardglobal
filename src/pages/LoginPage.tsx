import React, { useState } from 'react';
import {
  Globe2,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Database,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const { login, isSupabaseActive } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
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

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

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
                  placeholder=""
                  autoComplete="off"
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
                  placeholder=""
                  autoComplete="new-password"
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

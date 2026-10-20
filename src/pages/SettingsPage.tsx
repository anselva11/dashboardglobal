import React, { useState } from 'react';
import {
  Users,
  Shield,
  Database,
  Settings2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Briefcase,
  ShieldCheck,
  Globe2,
  Server,
  HardDrive,
  Lock,
  Activity,
  Clock,
  UserPlus,
  Search,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  AnimatedPage,
  StaggerList,
  FadeUp,
  AnimatedCard,
  motion,
} from '../components/motion';

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    registeredUsers,
    updateUserAvatar,
    auditLogs,
    isSupabaseActive,
    isDemoMode,
    setIsDemoMode,
    resetDemoData,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'users' | 'system' | 'audit' | 'security'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const filteredUsers = registeredUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections = [
    { id: 'users' as const, label: 'User Management', icon: Users, count: registeredUsers.length },
    { id: 'system' as const, label: 'System Info', icon: Server },
    { id: 'audit' as const, label: 'Audit Trail', icon: Activity, count: auditLogs.length },
    { id: 'security' as const, label: 'Security', icon: Shield },
  ];

  const roleIcons: Record<string, any> = {
    ceo: ShieldCheck,
    admin: KeyRound,
    komisaris: Briefcase,
  };

  const roleColors: Record<string, string> = {
    ceo: 'bg-blue-50 text-blue-700 border-blue-200',
    admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    komisaris: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const roleTitles: Record<string, string> = {
    ceo: 'CEO / Direktur Utama',
    admin: 'Administrator IT & Sistem',
    komisaris: 'Dewan Komisaris',
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* Page Header */}
        <FadeUp>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-navy-950 flex items-center gap-2">
                <Settings2 className="h-6 w-6 text-navy-700" />
                Pengaturan & Manajemen Sistem
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Kelola pengguna, keamanan, audit trail, dan konfigurasi sistem
              </p>
            </div>
            {currentUser.role === 'admin' && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
                  <KeyRound className="h-3.5 w-3.5" />
                  Admin Full Access
                </span>
              </div>
            )}
          </div>
        </FadeUp>

        {/* Section Tabs */}
        <FadeUp delay={0.1}>
          <div className="flex flex-wrap gap-2 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeSection === section.id
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                  {section.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activeSection === section.id
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {section.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </FadeUp>

        {/* USER MANAGEMENT */}
        {activeSection === 'users' && (
          <StaggerList className="space-y-4">
            {/* Search & Stats Row */}
            <FadeUp>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pengguna berdasarkan nama, email, atau role..."
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-navy-700 focus:ring-1 focus:ring-navy-700 outline-none transition-all"
                  />
                </div>
                <div className="flex items-center gap-3">
                  {['ceo', 'admin', 'komisaris'].map((role) => {
                    const count = registeredUsers.filter((u) => u.role === role).length;
                    return (
                      <div
                        key={role}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${roleColors[role]}`}
                      >
                        <span className="uppercase">{role}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeUp>

            {/* User Cards */}
            {filteredUsers.map((user, idx) => {
              const RoleIcon = roleIcons[user.role] || Shield;
              return (
                <AnimatedCard
                  key={user.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        avatar={user.avatar}
                        name={user.name}
                        role={user.role}
                        size="lg"
                      />
                      <div>
                        <p className="text-sm font-bold text-navy-950">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleColors[user.role]}`}
                          >
                            <RoleIcon className="h-3 w-3" />
                            {user.role.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {roleTitles[user.role] || user.title}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {user.avatar && (
                        <button
                          onClick={() => {
                            if (user.id === currentUser.id) {
                              updateUserAvatar('');
                            }
                          }}
                          className="px-2 py-0.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-[10px] font-medium"
                          title="Hapus Foto Profil"
                        >
                          Hapus Foto
                        </button>
                      )}
                      {user.created_at && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {user.created_at}
                        </span>
                      )}
                      {user.id === currentUser.id && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Active Session
                        </span>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              );
            })}

            {filteredUsers.length === 0 && (
              <FadeUp>
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Tidak ada pengguna ditemukan</p>
                </div>
              </FadeUp>
            )}
          </StaggerList>
        )}

        {/* SYSTEM INFO */}
        {activeSection === 'system' && (
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatedCard className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-navy-900 flex items-center justify-center">
                  <Globe2 className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-950">Informasi Organisasi</h3>
                  <p className="text-xs text-slate-500">Data perusahaan terdaftar</p>
                </div>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Nama Perusahaan</span>
                  <span className="font-semibold text-navy-950">PT Global Expor Indonesia</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Industri</span>
                  <span className="font-semibold text-navy-950">International Export Trading</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Komoditas Utama</span>
                  <span className="font-semibold text-navy-950">Coconut Shell Charcoal Briquettes</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Organization ID</span>
                  <span className="font-mono text-[11px] text-slate-600">org-001</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Lokasi</span>
                  <span className="font-semibold text-navy-950">Indonesia 🇮🇩</span>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-950">Database & Backend</h3>
                  <p className="text-xs text-slate-500">Status koneksi dan storage</p>
                </div>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Supabase Status</span>
                  <span
                    className={`flex items-center gap-1.5 font-semibold ${
                      isSupabaseActive ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isSupabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    {isSupabaseActive ? 'Connected (PostgreSQL)' : 'Local Storage Mode'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Auth Provider</span>
                  <span className="font-semibold text-navy-950">
                    {isSupabaseActive ? 'Supabase Auth' : 'Local Database Auth'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Demo Mode</span>
                  <button
                    onClick={() => setIsDemoMode(!isDemoMode)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                      isDemoMode
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isDemoMode ? 'DEMO ACTIVE' : 'PRODUCTION'}
                  </button>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Total Users</span>
                  <span className="font-bold text-navy-950">{registeredUsers.length}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Row Level Security</span>
                  <span className="font-semibold text-emerald-600">Enforced</span>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <HardDrive className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-950">Technology Stack</h3>
                  <p className="text-xs text-slate-500">Teknologi yang digunakan dashboard ini</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'React + TypeScript', version: 'v19.x', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { name: 'Vite', version: 'v8.x', color: 'bg-violet-50 border-violet-200 text-violet-700' },
                  { name: 'Tailwind CSS', version: 'v3.x', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
                  { name: 'Framer Motion', version: 'v12.x', color: 'bg-pink-50 border-pink-200 text-pink-700' },
                  { name: 'Recharts', version: 'v2.x', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                  { name: 'Supabase', version: 'v2.x', color: 'bg-green-50 border-green-200 text-green-700' },
                  { name: 'Lucide Icons', version: 'Latest', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                  { name: 'Zod + React Hook Form', version: 'v3.x', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                ].map((tech) => (
                  <div
                    key={tech.name}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-semibold ${tech.color}`}
                  >
                    <p className="font-bold">{tech.name}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{tech.version}</p>
                  </div>
                ))}
              </div>
            </AnimatedCard>

            {/* Reset Demo Data */}
            <FadeUp>
              <div className="md:col-span-2 bg-red-50 rounded-xl border border-red-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-red-900">Reset Data Demo</h3>
                      <p className="text-xs text-red-700 mt-0.5">
                        Mengembalikan semua data ke kondisi awal demo. Semua perubahan yang dilakukan akan hilang.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetDemoData}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Reset Semua Data
                  </button>
                </div>
              </div>
            </FadeUp>
          </StaggerList>
        )}

        {/* AUDIT TRAIL */}
        {activeSection === 'audit' && (
          <StaggerList className="space-y-3">
            <FadeUp>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-navy-700" />
                    <span className="text-xs font-bold text-navy-950">
                      Audit Log ({auditLogs.length} entries)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Sorted by most recent</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-10">
                      <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Belum ada aktivitas tercatat</p>
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-5 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  log.action.includes('WON')
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : log.action.includes('LOST')
                                    ? 'bg-red-50 text-red-700'
                                    : log.action.includes('REGISTERED')
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {log.action.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[10px] text-slate-400">by</span>
                              <span className="text-xs font-semibold text-navy-950">
                                {log.user_name}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                  roleColors[log.user_role] || 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {log.user_role}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{log.details}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[10px] text-slate-400 font-mono">
                              {new Date(log.timestamp).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </FadeUp>
          </StaggerList>
        )}

        {/* SECURITY */}
        {activeSection === 'security' && (
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatedCard className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-950">Keamanan Otentikasi</h3>
                  <p className="text-xs text-slate-500">Konfigurasi login dan akses</p>
                </div>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { label: 'Password Hash', value: 'bcrypt (via Supabase)', ok: true },
                  { label: 'Login Rate Limiting', value: 'Active', ok: true },
                  { label: 'Role Enforcement', value: 'CEO, Admin, Komisaris Only', ok: true },
                  { label: 'Session Storage', value: 'LocalStorage + Supabase JWT', ok: true },
                  { label: 'HTTPS Enforcement', value: 'Production Ready', ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-navy-900 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-950">Row Level Security (RLS)</h3>
                  <p className="text-xs text-slate-500">Kebijakan akses data per-role</p>
                </div>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { role: 'CEO', access: 'Full CRUD — semua data bisnis & keuangan', level: 'Full' },
                  { role: 'Admin', access: 'Sistem, user management, audit logs', level: 'System' },
                  { role: 'Komisaris', access: 'Read-only — laporan & governance', level: 'View' },
                ].map((item) => (
                  <div key={item.role} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-navy-950">{item.role}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.level === 'Full'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : item.level === 'System'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.level} Access
                      </span>
                    </div>
                    <p className="text-slate-500">{item.access}</p>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </StaggerList>
        )}
      </div>
    </AnimatedPage>
  );
};

import React, { useState } from 'react';
import {
  Bell,
  Search,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  LogOut,
  KeyRound,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import type { Currency, UserRole } from '../../types';

interface NavbarProps {
  activeTabTitle: string;
  onNavigateTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTabTitle, onNavigateTab }) => {
  const {
    currentUser,
    setCurrentRole,
    logout,
    currency,
    setCurrency,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dateRange,
    setDateRange,
    globalSearch,
    setGlobalSearch,
    resetDemoData,
    isDemoMode,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.is_read);

  const rolesConfig: { role: UserRole; label: string; desc: string; icon: any }[] = [
    {
      role: 'ceo',
      label: 'CEO / Direktur Utama',
      desc: 'Full commercial control & target approval',
      icon: ShieldCheck,
    },
    {
      role: 'admin',
      label: 'Admin (IT & Sistem)',
      desc: 'Database, user access, and system logs',
      icon: KeyRound,
    },
    {
      role: 'komisaris',
      label: 'Dewan Komisaris',
      desc: 'Executive board governance & audit oversight',
      icon: Briefcase,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-subtle no-print">
      {/* Left: Active Tab Title & Search */}
      <div className="flex items-center space-x-4 flex-1">
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-navy-950 flex items-center space-x-2">
            <span>{activeTabTitle}</span>
            {isDemoMode && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                DEMO DATA
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">PT Global Expor Indonesia — Export Intelligence</p>
        </div>

        {/* Global Search */}
        <div className="relative max-w-xs w-full hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search buyers, POs, deals..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-200 focus:border-navy-700 rounded-lg outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Date Filter */}
        <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          {(['this_month', 'this_quarter', 'this_year', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                dateRange === range
                  ? 'bg-white text-navy-950 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              {range.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          {(['IDR', 'USD', 'EUR'] as Currency[]).map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors ${
                currency === curr
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
              title={`Switch reporting currency to ${curr}`}
            >
              {curr}
            </button>
          ))}
        </div>

        {/* Notification Bell with Badge & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notification Center"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white p-3 shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-navy-950">Notifications & Alerts</span>
                  {unreadNotifications.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700 font-semibold">
                      {unreadNotifications.length} New
                    </span>
                  )}
                </div>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-navy-700 hover:text-navy-900 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link_tab) {
                          onNavigateTab(n.link_tab);
                          setShowNotifications(false);
                        }
                      }}
                      className={`pt-2 cursor-pointer transition-colors p-2 rounded-lg ${
                        n.is_read ? 'bg-transparent opacity-70' : 'bg-slate-50/80 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <span
                          className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                            n.severity === 'urgent'
                              ? 'bg-red-600'
                              : n.severity === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-navy-600'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between">
                <button
                  onClick={() => {
                    onNavigateTab('notifications');
                    setShowNotifications(false);
                  }}
                  className="text-xs text-navy-700 hover:text-navy-900 font-semibold flex items-center space-x-1"
                >
                  <span>Open Activity Center</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
                <button
                  onClick={resetDemoData}
                  className="text-[11px] text-slate-500 hover:text-red-600 flex items-center space-x-1"
                  title="Restore clean initial demo records"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors bg-white shadow-xs"
          >
            <UserAvatar
              avatar={currentUser.avatar}
              name={currentUser.name}
              role={currentUser.role}
              size="sm"
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-navy-950 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                {currentUser.role}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Peran & Akun Pengguna</p>
                <p className="text-[11px] text-slate-500">Khusus: CEO, Admin, atau Komisaris</p>
              </div>

              <div className="space-y-1 mt-1.5">
                {rolesConfig.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = currentUser.role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        setCurrentRole(item.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-navy-900 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isCurrent ? 'text-amber-400' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-bold">{item.label}</p>
                          <p className={`text-[10px] ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Logout button */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar Akun (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

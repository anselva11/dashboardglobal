import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Kanban,
  Ship,
  Boxes,
  DollarSign,
  Target,
  BellRing,
  FileText,
  ChevronLeft,
  ChevronRight,
  Flame,
  Globe2,
  Settings2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  const { buyers, opportunities, exportOrders, notifications, currentUser, logout } = useApp();

  // Dynamic counts for badge indicators
  const overdueFollowUps = buyers.filter((b) => {
    if (!b.next_follow_up_date) return false;
    return new Date(b.next_follow_up_date) < new Date('2026-10-20');
  }).length;

  const activeOrdersCount = exportOrders.filter(
    (o) => o.shipment_status !== 'delivered'
  ).length;

  const openDealsCount = opportunities.filter(
    (o) => o.stage !== 'closed_won' && o.stage !== 'closed_lost'
  ).length;

  const unreadNotifs = notifications.filter((n) => !n.is_read).length;

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Sales Analytics',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'crm',
      label: 'Buyer CRM',
      icon: Users,
      badge: overdueFollowUps > 0 ? `${overdueFollowUps} Overdue` : null,
      badgeColor: 'bg-red-100 text-red-700',
    },
    {
      id: 'pipeline',
      label: 'Sales Pipeline',
      icon: Kanban,
      badge: openDealsCount > 0 ? `${openDealsCount}` : null,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'orders',
      label: 'Export Orders',
      icon: Ship,
      badge: activeOrdersCount > 0 ? `${activeOrdersCount} Active` : null,
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'products',
      label: 'Products & Pricing',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'financials',
      label: 'Financial Overview',
      icon: DollarSign,
      badge: null,
    },
    {
      id: 'scorecard',
      label: 'KPI Scorecard',
      icon: Target,
      badge: null,
    },
    {
      id: 'notifications',
      label: 'Activity Center',
      icon: BellRing,
      badge: unreadNotifs > 0 ? `${unreadNotifs}` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'reports',
      label: 'Reports & Export',
      icon: FileText,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings & Admin',
      icon: Settings2,
      badge: null,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 bg-navy-950 text-slate-100 transition-all duration-300 no-print ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-4 border-b border-navy-900 justify-between">
        {!collapsed ? (
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-navy-950 shadow-md font-bold text-lg flex-shrink-0">
              <Globe2 className="h-5 w-5 text-navy-950" />
            </div>
            <div className="leading-none overflow-hidden">
              <h2 className="text-sm font-extrabold tracking-tight text-white uppercase truncate">
                PT Global Expor
              </h2>
              <span className="text-[10px] text-amber-400/90 font-medium tracking-wider">
                INDONESIA
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-navy-950 shadow-md font-bold text-lg">
            <Globe2 className="h-5 w-5 text-navy-950" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 transition-colors ${
            collapsed ? 'hidden' : 'block'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Hero Commodity Tag */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 bg-navy-900/80 rounded-lg border border-navy-800 flex items-center space-x-2">
          <Flame className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="text-[11px] font-semibold text-slate-200 truncate">Coconut Shell Charcoal</p>
            <p className="text-[9px] text-slate-400 truncate">Primary Export Commodity</p>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-navy-800 text-white shadow-sm border border-navy-700/60 font-semibold'
                  : 'text-slate-400 hover:bg-navy-900/60 hover:text-slate-200'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`h-4 w-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                } ${collapsed ? 'mx-auto' : 'mr-3'}`}
              />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                        item.badgeColor || 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle when collapsed */}
      {collapsed && (
        <div className="p-3 border-t border-navy-900 flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-navy-900 bg-navy-950/60 text-[11px] text-slate-400 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-200 truncate max-w-[140px]">{currentUser.name}</p>
              <p className="text-[10px] text-amber-400 uppercase font-semibold">
                {currentUser.role === 'ceo'
                  ? 'CEO / Direktur Utama'
                  : currentUser.role === 'admin'
                  ? 'Administrator IT'
                  : 'Dewan Komisaris'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-navy-900 rounded-lg transition-colors"
              title="Keluar Akun"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="pt-1 border-t border-navy-900/60 flex items-center justify-between text-[10px] text-slate-500">
            <span>PT Global Expor</span>
            <span className="text-[9px] text-emerald-400 flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>DB Active</span>
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};

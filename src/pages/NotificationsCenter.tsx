import React, { useState } from 'react';
import {
  BellRing,
  Clock,
  AlertTriangle,
  DollarSign,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NotificationsCenterProps {
  onNavigateTab: (tab: string) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({ onNavigateTab }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'follow_up' | 'missing_doc' | 'payment'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'urgent') return n.severity === 'urgent';
    return n.type === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-navy-950 flex items-center space-x-2">
            <BellRing className="h-4 w-4 text-navy-900" />
            <span>Activity & Follow-Up Intelligence Center</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {notifications.filter((n) => !n.is_read).length} Actionable Alerts
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time monitoring of follow-ups, pending quotation responses, closing dates, and shipping document deadlines
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          <span>Mark All As Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'urgent', label: '🚨 High Priority / Overdue' },
          { id: 'follow_up', label: 'Buyer Follow-ups' },
          { id: 'missing_doc', label: 'Missing Shipping Docs' },
          { id: 'payment', label: 'Payment Deadlines' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeFilter === tab.id
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            No activity notifications match the selected filter.
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isUrgent = n.severity === 'urgent';
            const isWarning = n.severity === 'warning';

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white ${
                  !n.is_read
                    ? isUrgent
                      ? 'border-red-300 bg-red-50/20 shadow-xs'
                      : isWarning
                      ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                      : 'border-blue-200 shadow-xs'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
                      isUrgent
                        ? 'bg-red-100 text-red-700'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {n.type === 'missing_doc' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : n.type === 'follow_up' ? (
                      <Clock className="h-4 w-4" />
                    ) : n.type === 'payment' ? (
                      <DollarSign className="h-4 w-4" />
                    ) : (
                      <BellRing className="h-4 w-4" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-navy-950 text-xs">{n.title}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          isUrgent
                            ? 'bg-red-100 text-red-800'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {n.severity}
                      </span>
                      {!n.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px] max-w-2xl">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                  {n.link_tab && (
                    <button
                      onClick={() => {
                        markNotificationRead(n.id);
                        onNavigateTab(n.link_tab!);
                      }}
                      className="px-3 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors flex items-center space-x-1"
                    >
                      <span>Take Action</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => markNotificationRead(n.id)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationsAsRead } from 'src/lib/mockDb';
import { Bell, CheckCheck, Clock, RefreshCw } from 'lucide-react';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const load = useCallback(() => {
    setNotifications(getNotifications('admin@gmail.com'));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkAllRead = () => {
    markNotificationsAsRead('admin@gmail.com');
    load();
  };

  const displayed = filter === 'unread'
    ? notifications.filter(n => n.unread)
    : notifications;

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Bell size={20} className="text-orange-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black text-white" style={{ background: '#D96C2F' }}>
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{notifications.length} total notification{notifications.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={load}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border cursor-pointer"
            style={{ background: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }}>
            <RefreshCw size={13} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white cursor-pointer"
              style={{ background: '#D96C2F' }}>
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[['all', 'All'], ['unread', 'Unread']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all"
            style={filter === val
              ? { background: '#D96C2F', color: '#FFF7ED', borderColor: 'rgba(217,108,47,0.5)' }
              : { background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }}>
            {label}
            {val === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-red-100 text-red-600 rounded-full px-1.5 py-0.5 text-[9px] font-black">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl text-slate-400">
          <Bell size={36} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold">No {filter === 'unread' ? 'unread ' : ''}notifications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(n => (
            <div key={n.id}
              className="flex items-start gap-4 px-5 py-4 rounded-2xl border shadow-sm transition-all"
              style={{
                background: n.unread ? '#FFF7ED' : '#FFFFFF',
                borderColor: n.unread ? '#FED7AA' : '#e2e8f0',
              }}>
              {/* Dot */}
              <div className="shrink-0 mt-1">
                <div className="w-2.5 h-2.5 rounded-full"
                  style={{ background: n.unread ? '#D96C2F' : '#CBD5E1' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-relaxed"
                  style={{ fontWeight: n.unread ? 600 : 400 }}>
                  {n.text}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                <Clock size={11} />
                {timeAgo(n.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

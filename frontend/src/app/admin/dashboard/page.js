'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from 'src/components/StatCard';
import BookingTable from 'src/components/BookingTable';
import { getBookings } from 'src/lib/mockDb';
import { CalendarDays, AlertTriangle, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    completed: 0,
    pendingApproval: 0
  });

  useEffect(() => {
    const list = getBookings();
    setBookings(list);

    // Calculate metrics
    const todayStr = new Date().toISOString().split('T')[0]; // Format yyyy-mm-dd
    const todayCount = list.filter(b => b.date === todayStr || b.date === '2026-07-19').length;
    const completedCount = list.filter(b => b.status === 'Completed').length;
    const pendingCount = list.filter(b => b.status !== 'Completed').length;
    const pendingApprovalCount = list.filter(b => b.status === 'Waiting for Approval').length;

    setStats({
      total: list.length,
      today: todayCount,
      pending: pendingCount,
      completed: completedCount,
      pendingApproval: pendingApprovalCount
    });
  }, []);

  const handleManageBooking = (booking) => {
    router.push(`/admin/bookings?id=${booking.id}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Admin Control Panel</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time status of service appointments, inspections, and customer approvals.</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Bookings" value={stats.total} icon="CalendarDays" color="blue" />
        <StatCard title="Today's Appointments" value={stats.today} icon="TrendingUp" color="purple" />
        <StatCard title="Pending Services" value={stats.pending} icon="Clock" color="amber" />
        <StatCard title="Completed Services" value={stats.completed} icon="CheckCircle" color="emerald" />
        <StatCard title="Pending Approvals" value={stats.pendingApproval} icon="AlertTriangle" color="orange" />
      </div>

      {/* Recent Bookings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Recent Service Bookings</h2>
          <button
            onClick={() => router.push('/admin/bookings')}
            className="text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors cursor-pointer"
          >
            Manage All Appointments →
          </button>
        </div>

        <BookingTable
          bookings={bookings.slice(0, 5)} // Show top 5 recent
          onActionClick={handleManageBooking}
          onSelect={handleManageBooking}
        />
      </div>
    </div>
  );
}

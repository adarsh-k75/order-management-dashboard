'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AppLayout } from '../components/AppLayout';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { orderService } from '../services/orderService';
import { useWebSocket } from '../hooks/useWebSocket';
import { formatINR, formatUSD, formatDate } from '../utils';

export default function DashboardPage() {
  // 1. useState: React state hooks to store dynamic data.
  // When these states change, React automatically updates the page interface.
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. useCallback: Memoizes (saves) this function so it does not get recreated on every component render.
  // This is a performance optimization, especially when passing the function to child components.
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      // Promise.all runs multiple asynchronous api requests in parallel for better speed.
      const [statsData, ordersData] = await Promise.all([
        orderService.getOrderStats(),
        orderService.getOrders({ limit: 5 }),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.orders);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Could not retrieve dashboard metrics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. useEffect: Triggers side effects when the component loads (mounts) or dependencies change.
  // Because the dependency array contains [fetchData], it will run once when the page loads.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle WebSocket message updates to keep stats and recent orders in real-time sync
  const handleWebSocketMessage = useCallback(
    (message) => {
      console.log('WS Message received on Dashboard:', message);
      const { event, data } = message;

      if (event === 'order_created') {
        // Prepend new order and keep recent orders limit to 5
        setRecentOrders((prev) => [data, ...prev].slice(0, 5));
        // Refresh counts
        orderService.getOrderStats().then(setStats).catch(console.error);
      } else if (event === 'order_status_updated') {
        // Update order status in recent orders if it exists
        setRecentOrders((prev) =>
          prev.map((order) => (order.id === data.id ? { ...order, ...data } : order))
        );
        // Refresh counts
        orderService.getOrderStats().then(setStats).catch(console.error);
      } else if (event === 'order_deleted') {
        // Remove order from recent list if deleted
        setRecentOrders((prev) => prev.filter((order) => order.id !== data.id));
        // Refresh counts
        orderService.getOrderStats().then(setStats).catch(console.error);
      }
    },
    []
  );

  const wsConnected = useWebSocket(handleWebSocketMessage);

  return (
    <AppLayout wsConnected={wsConnected}>
      <div className="space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Overview Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Real-time statistics of order transactions and statuses.</p>
          </div>
          <Link href="/orders">
            <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-sm shadow-teal-600/10 hover:shadow-md hover:shadow-teal-600/10">
              Manage Orders
            </button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm text-rose-600 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm h-32 animate-pulse flex flex-col justify-between">
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-8 bg-slate-100 rounded w-1/2" />
                <div className="h-1 bg-slate-100 rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <Card
              title="TOTAL ORDERS"
              value={stats.total}
              accentColor="border-teal-500"
              icon={
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            />
            <Card
              title="PENDING"
              value={stats.pending}
              accentColor="border-amber-400"
              icon={
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <Card
              title="PROCESSING"
              value={stats.processing}
              accentColor="border-sky-400"
              icon={
                <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              }
            />
            <Card
              title="COMPLETED"
              value={stats.completed}
              accentColor="border-emerald-500"
              icon={
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <Card
              title="CANCELLED"
              value={stats.cancelled}
              accentColor="border-rose-400"
              icon={
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        )}

        {/* Recent Orders Table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">Recent Orders Activity</h2>
            <Link href="/orders" className="text-teal-600 hover:text-teal-700 text-xs font-semibold hover:underline">
              View All Orders &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 border border-slate-100/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
              <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm font-medium text-slate-500">No orders registered yet</p>
              <p className="text-xs text-slate-400 mt-1">Start by adding a new order record in the manager console.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (INR)</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (USD)</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="px-5 py-4 font-semibold text-slate-800">{order.customer_name}</td>
                      <td className="px-5 py-4 font-mono font-medium text-slate-700">{formatINR(order.amount)}</td>
                      <td className="px-5 py-4 font-mono text-slate-400">
                        {order.amount_usd !== undefined ? formatUSD(order.amount_usd) : 'Converting...'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Badge status={order.status} />
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-xs text-slate-400">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Table, ColumnHeader } from '../components/Table';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { orderService } from '../services/orderService';
import { useWebSocket } from '../hooks/useWebSocket';
import { Order, OrderStatus } from '../types';
import { formatINR, formatUSD, formatDate } from '../utils';

export default function OrdersPage() {
  // State for search, filter, sorting, pagination
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('-created_at'); // default: newest first
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Loading, saving, error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Active target for update/delete actions
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [updateStatusVal, setUpdateStatusVal] = useState<OrderStatus>('Pending');

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = (currentPage - 1) * limit;
      const data = await orderService.getOrders({
        search: search.trim() || undefined,
        status_filter: statusFilter || undefined,
        sort: sort || undefined,
        skip,
        limit,
      });
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err: any) {
      console.error(err);
      setError('Could not retrieve orders. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, statusFilter, sort]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Adjust page counter if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // WebSocket update handler
  const handleWebSocketMessage = useCallback(
    (message: { event: string; data: any }) => {
      console.log('WS Message received on Orders Manager:', message);
      const { event, data } = message;

      if (event === 'order_created') {
        // Prepend new order if we are on page 1, or re-fetch
        fetchOrders();
      } else if (event === 'order_status_updated') {
        // Find and update status in state
        setOrders((prev) =>
          prev.map((order) => (order.id === data.id ? { ...order, ...data } : order))
        );
      } else if (event === 'order_deleted') {
        // Filter out from active state
        setOrders((prev) => prev.filter((order) => order.id !== data.id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    },
    [fetchOrders]
  );

  const wsConnected = useWebSocket(handleWebSocketMessage);

  // Sort toggle handler
  const handleSort = (key: string) => {
    if (sort === key) {
      setSort(`-${key}`); // reverse
    } else {
      setSort(key); // sort asc
    }
  };

  // ----------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------

  // Create Order Submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !amount) return;

    setIsSaving(true);
    setError(null);
    try {
      await orderService.createOrder({
        customer_name: customerName.trim(),
        amount: parseFloat(amount),
      });
      setIsCreateOpen(false);
      setCustomerName('');
      setAmount('');
      // WebSocket will trigger re-fetch automatically, but re-fetching here ensures consistency
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setIsSaving(false);
    }
  };

  // Update Status Submission
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSaving(true);
    setError(null);
    try {
      await orderService.updateOrderStatus(selectedOrder.id, updateStatusVal);
      setIsStatusOpen(false);
      setSelectedOrder(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Order Submission
  const handleDeleteSubmit = async () => {
    if (!selectedOrder) return;

    setIsSaving(true);
    setError(null);
    try {
      await orderService.deleteOrder(selectedOrder.id);
      setIsDeleteOpen(false);
      setSelectedOrder(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete order');
    } finally {
      setIsSaving(false);
    }
  };

  // Table Headers
  const columns: ColumnHeader[] = [
    { label: 'Customer', key: 'customer_name', sortable: true },
    { label: 'Amount (INR)', key: 'amount', sortable: true },
    { label: 'Amount (USD)', sortable: false },
    { label: 'Status', key: 'status', sortable: true },
    { label: 'Created At', key: 'created_at', sortable: true },
    { label: 'Actions', sortable: false },
  ];

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AppLayout wsConnected={wsConnected}>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Orders Manager</h1>
            <p className="text-sm text-slate-400 mt-1">Create, update, and manage transactions.</p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="shadow-sm shadow-teal-600/10 hover:shadow-md hover:shadow-teal-600/10"
          >
            Create New Order
          </Button>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm text-rose-600 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:max-w-md">
            <Input
              type="text"
              placeholder="Search by customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-2.5 px-4 text-sm"
            />
          </div>

          <div className="w-full md:w-48 flex flex-col">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 text-sm transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          // Skeleton Loader
          <div className="space-y-4">
            <div className="h-12 bg-slate-100 rounded-xl animate-pulse w-full" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-white border border-slate-100/50 rounded-xl animate-pulse w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          // Empty State
          <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-bold text-slate-700 tracking-tight">No orders found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Try resetting your filters or create a new order profile.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Table columns={columns} onSort={handleSort} currentSort={sort}>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/30 transition-colors duration-150">
                  <td className="px-6 py-4.5 font-semibold text-slate-800">{order.customer_name}</td>
                  <td className="px-6 py-4.5 font-mono text-slate-700 font-medium">{formatINR(order.amount)}</td>
                  <td className="px-6 py-4.5 font-mono text-slate-400">
                    {order.amount_usd !== undefined ? formatUSD(order.amount_usd) : 'Converting...'}
                  </td>
                  <td className="px-6 py-4.5">
                    <Badge status={order.status} />
                  </td>
                  <td className="px-6 py-4.5 font-mono text-xs text-slate-400">{formatDate(order.created_at)}</td>
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setUpdateStatusVal(order.status);
                          setIsStatusOpen(true);
                        }}
                        className="text-teal-600 hover:text-teal-800 text-xs font-semibold hover:bg-teal-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDeleteOpen(true);
                        }}
                        className="text-rose-500 hover:text-rose-700 text-xs font-semibold hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 px-2">
              <span className="text-xs text-slate-400 font-medium">
                Page {currentPage} of {totalPages} (Total {total} orders)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            MODALS
        ---------------------------------------------------- */}

        {/* Create Order Modal */}
        <Modal
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setCustomerName('');
            setAmount('');
          }}
          title="Create New Order Profile"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-5">
            <Input
              label="Customer Name"
              type="text"
              placeholder="e.g. John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={isSaving}
              required
            />
            
            <Input
              label="Transaction Amount (INR)"
              type="number"
              step="0.01"
              placeholder="e.g. 5000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSaving}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Create Order
              </Button>
            </div>
          </form>
        </Modal>

        {/* Update Status Modal */}
        <Modal
          isOpen={isStatusOpen}
          onClose={() => {
            setIsStatusOpen(false);
            setSelectedOrder(null);
          }}
          title="Update Order Status"
        >
          <form onSubmit={handleStatusSubmit} className="space-y-5">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Client:</span> {selectedOrder?.customer_name} <br/>
              <span className="font-semibold text-slate-700">Amount:</span> {selectedOrder && formatINR(selectedOrder.amount)}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Select Status
              </label>
              <select
                value={updateStatusVal}
                onChange={(e) => setUpdateStatusVal(e.target.value as OrderStatus)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 text-sm transition-all duration-200"
                disabled={isSaving}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStatusOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedOrder(null);
          }}
          title="Delete Order Record"
        >
          <div className="space-y-4">
            <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl text-xs text-rose-700 flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-bold">Caution: This action is permanent!</span>
                <p className="mt-1 font-normal text-rose-600/80">Are you sure you want to delete the order record for <strong className="text-rose-700">"{selectedOrder?.customer_name}"</strong> with value {selectedOrder && formatINR(selectedOrder.amount)}?</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteSubmit}
                isLoading={isSaving}
              >
                Delete Record
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </AppLayout>
  );
}

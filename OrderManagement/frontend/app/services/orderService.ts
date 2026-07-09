import api from './api';
import { APIResponse, Order, OrderStats } from '../types';

export interface GetOrdersParams {
  search?: string;
  status_filter?: string;
  sort?: string;
  skip?: number;
  limit?: number;
}

export const orderService = {
  /**
   * Fetch paginated list of orders with filter, sorting, and search.
   */
  getOrders: async (params: GetOrdersParams = {}): Promise<{ orders: Order[]; total: number }> => {
    // Map empty string values to undefined so they are excluded from the query parameters
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
    );
    
    const response = await api.get<APIResponse<{ orders: Order[]; total: number }>>('/orders', {
      params: cleanParams,
    });
    
    return response.data.data;
  },

  /**
   * Get single order detail by ID.
   */
  getOrderById: async (id: number): Promise<Order> => {
    const response = await api.get<APIResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  /**
   * Create a new order (customer_name and amount in INR).
   */
  createOrder: async (orderData: { customer_name: string; amount: number }): Promise<Order> => {
    const response = await api.post<APIResponse<Order>>('/orders', orderData);
    return response.data.data;
  },

  /**
   * Update status of an existing order.
   */
  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const response = await api.patch<APIResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Delete an order.
   */
  deleteOrder: async (id: number): Promise<{ id: number }> => {
    const response = await api.delete<APIResponse<{ id: number }>>(`/orders/${id}`);
    return response.data.data;
  },

  /**
   * Fetch statistical dashboard metrics.
   */
  getOrderStats: async (): Promise<OrderStats> => {
    const response = await api.get<APIResponse<OrderStats>>('/orders/stats');
    return response.data.data;
  }
};

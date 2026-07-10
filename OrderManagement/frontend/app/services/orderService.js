import api from './api';

export const orderService = {
  /**
   * Fetch paginated list of orders with filter, sorting, and search.
   */
  getOrders: async (params = {}) => {
    // Create a new object for cleaned parameters
    const cleanParams = {};
    
    // Simple for-in loop to filter out keys with undefined or empty string values.
    // This prevents sending empty query parameters to the backend api.
    for (const key in params) {
      const value = params[key];
      if (value !== undefined && value !== '') {
        cleanParams[key] = value;
      }
    }
    
    const response = await api.get('/orders', {
      params: cleanParams,
    });
    
    return response.data.data;
  },

  /**
   * Get single order detail by ID.
   */
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  /**
   * Create a new order (customer_name and amount in INR).
   */
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  },

  /**
   * Update status of an existing order.
   */
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Delete an order.
   */
  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data.data;
  },

  /**
   * Fetch statistical dashboard metrics (counts for total, pending, processing, completed, cancelled).
   */
  getOrderStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data.data;
  }
};

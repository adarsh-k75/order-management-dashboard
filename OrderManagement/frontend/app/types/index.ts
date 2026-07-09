export interface User {
  id: number;
  username: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

export interface Order {
  id: number;
  customer_name: string;
  amount: number; // Stored in INR
  status: OrderStatus;
  created_at: string;
  amount_usd?: number; // Dynamically added
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}

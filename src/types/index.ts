// Add to existing types
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_details?: any;
  created_at: string;
  updated_at: string;
  order?: {
    order_number: string;
    user?: {
      name: string;
    };
  };
}
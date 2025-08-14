export interface Subscription {
    id: number;
    user_id: number;
    plan_id: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'expired' | 'canceled' | 'pending';
    payment_method?: string;
    transaction_id?: string;
  }

  export interface Subscriptions {
  id: number;
  user_id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'canceled' | 'pending';
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
  
  user?: {
    id: number;
    name: string;
    email: string;
  };
  
  plan?: {
    id: number;
    name: string;
    price: number;
    duration: number; 
    features: string[];
  };
}


export interface Payment {
    id: number;
    transaction_id: string;
    amount: number;
    currency: string;
    status: string;
    payment_date: Date;
    refund_date: Date;
    userId: number;
    subscriptionId: number
  }

 export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
  }
  
  export interface PaymentMethod {
    id: string;
    card: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
    };
  }
  
  export interface PaymentStatus {
    status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 
            'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  }
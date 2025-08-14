export interface Plan {
    id: number;
    name: string;
    description: string;
    price: string;
    duration_days: number;
    features: string[];
    is_active: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
  }
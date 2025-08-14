export interface Project {
    id: string;
    name: string;
    description: string;
    logo: string | null;
    color: string;
    status: 'active' | 'archived' | 'pending';
    is_blocked: boolean;
    userId: number;
    isDisabled?: boolean;
    Users?: {
    id: number;
    name: string;
    email: string;
    };
    createdAt?: Date; 
    updatedAt?: Date;
  }
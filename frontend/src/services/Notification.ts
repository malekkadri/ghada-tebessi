export interface Notification {
    id: number;
    user_id?: number;
    title: string;
    message: string;
    isRead: boolean;
    redirectUrl?: string;
    created_at: string;
    updated_at?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }
export interface ActivityLog {
  id: number;
  userId: number;
  activityType: string;
  activityLabel: string;
  ipAddress: string;
  userAgent: string;
  location: string | null;
  device: string;
  os: string | null;
  browser: string | null;
  metadata: any | null;
  createdAt: string;
  timeAgo?: string;
  formattedDate?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
  
  export type ActivityLogType =
    | 'login_success'
    | 'login_failed'
    | 'logout'
    | 'register_success'
    | 'login_success_with_google'
    | 'login_failed_with_google'
    | 'password_changed_success'
    | 'password_changed_failed'
    | 'password_reset_request'
    | 'password_reset_success'
    | 'email_verification_success'
    | 'two_factor_enabled'
    | 'two_factor_disabled'
    | 'two_factor_login_success'
    | 'two_factor_login_failed';
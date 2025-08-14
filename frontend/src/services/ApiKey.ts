export interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface ApiKey {
  id: number;
  name: string;
  prefix: string;
  scopes: string[];
  expiresAt: string | null;
  isActive: boolean;
  lastUsedAt: string | null;
  created_at: string;
  isDisabled?: boolean;
  Users?: UserInfo;
}

export interface ApiKeyListResponse {
  success: boolean;
  data: ApiKey[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface ApiKeyWithToken extends ApiKey {
  key: string;
}
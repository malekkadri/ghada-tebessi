export interface CustomDomain {
  id: number;
  domain: string;
  userId: number;
  status: 'pending' | 'active' | 'failed' | 'blocked';
  custom_index_url?: string;
  custom_not_found_url?: string;
  verification_code?: string;
  cname_target?: string;
  vcardId?: number;
  vcard?: {
    id: number;
    name: string;
    url: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  created_at: string;
  isDisabled?: boolean;
}

export interface DNSInstructions {
  cname: { name: string; value: string };
  txt: { name: string; value: string };
}
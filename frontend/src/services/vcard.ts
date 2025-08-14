import { Pixel } from "./Pixel";

export interface Block {
    id: string;
    name: string;
    description: string;
    type_block: string;
    status: boolean;
    vcardId: number;
    isDisabled?: boolean;
  }
  
  export interface VCard {
    id: string;
    name: string;
    description: string;
    logo: string | null;
    favicon: string | null;
    background_value: string;
    background_type: 'color' | 'custom-image' | 'gradient' | 'gradient-preset';
    font_family: string;
    font_size: number;
    is_active: boolean;
    is_share: boolean;
    is_downloaded: boolean;
    url: string;
    qr_code: string | null;
    views: number;
    status: boolean;
    projectId: number;
    opengraph?: string; 
    search_engine_visibility: boolean; 
    remove_branding: boolean; 
    pixels?: Pixel[];
    isDisabled?: boolean;
    createdAt?: Date; 
    updatedAt?: Date;
  }
  
  export interface BlockIconConfig {
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    shadow: string;
  }
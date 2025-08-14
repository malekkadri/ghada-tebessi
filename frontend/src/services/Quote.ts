export enum QuoteService {
  DigitalBusinessCards = 'Digital business cards',
  AnalyticsTracking = 'analytics & Tracking',
  CustomDesign = 'custom design',
  EntrepriseSolutions = 'entreprise solutions'
}

export interface Quote {
  id: number;
  name: string;
  email: string;
  service: QuoteService;
  description: string;
  createdAt: string;
}
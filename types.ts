
export enum AppView {
  HOME = 'home',
  DASHBOARD = 'dashboard',
  CAMPAIGNS = 'campaigns',
  AI_STUDIO = 'ai-studio',
  ANALYTICS = 'analytics',
  LEADS = 'leads',
  SETTINGS = 'settings',
  CREATE_CAMPAIGN = 'create-campaign',
  CONTACT_US = 'contact-us'
}

export type AuthMode = 'landing' | 'login' | 'signup';

export interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Draft' | 'Completed' | 'Paused';
  leads: number;
  conversion: number;
  lastUpdated: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  score: number;
  status: string;
  source: string;
}

export interface AIContentRequest {
  channel: 'Email' | 'Social' | 'Ad Copy';
  prompt: string;
  tone: string;
}

export interface AIContentResult {
  subject?: string;
  content: string;
  hashtags?: string[];
}

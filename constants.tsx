
import React from 'react';
import { Upload, Cpu, ShieldCheck, Target, CheckCircle, Download } from 'lucide-react';

export const COLORS = {
  primary: '#F97316',
  white: '#FFFFFF',
  gray: '#F3F4F6',
  text: '#111827'
};

export const FEATURES = [
  {
    title: "Easy CSV Upload",
    description: "Securely upload your customer demographic and behavioral data in standard CSV format.",
    icon: <Upload className="w-6 h-6 text-orange-primary" />
  },
  {
    title: "AI-Powered Generation",
    description: "Generate highly personalized, context-aware marketing messages using Gemini 3.",
    icon: <Cpu className="w-6 h-6 text-orange-primary" />
  },
  {
    title: "Compliance First",
    description: "Automatic checks against BFSI regulatory guidelines to ensure every message is safe.",
    icon: <ShieldCheck className="w-6 h-6 text-orange-primary" />
  },
  {
    title: "Targeted Messaging",
    description: "Customize tone and language based on specific customer segments and product types.",
    icon: <Target className="w-6 h-6 text-orange-primary" />
  },
  {
    title: "Review & Approve",
    description: "A streamlined workflow to review AI-generated content before it goes live.",
    icon: <CheckCircle className="w-6 h-6 text-orange-primary" />
  },
  {
    title: "Export Results",
    description: "Download your completed campaign data as a ready-to-use CSV for your CRM.",
    icon: <Download className="w-6 h-6 text-orange-primary" />
  }
];

export const PROCESS_STEPS = [
  { number: 1, title: "Upload CSV", desc: "Import your audience data" },
  { number: 2, title: "Configure", desc: "Set tone and compliance rules" },
  { number: 3, title: "Review", desc: "Verify generated content" },
  { number: 4, title: "Download", desc: "Get your campaign assets" }
];

export const STATS = [
  { label: "Campaigns Generated", value: "10,000+" },
  { label: "Compliance Rate", value: "99.8%" },
  { label: "Time Saved", value: "85%" }
];

// Added missing mock data constants to fix import errors in Dashboard.tsx and LeadsCRM.tsx
export const ANALYTICS_DATA = [
  { name: 'Mon', clicks: 400 },
  { name: 'Tue', clicks: 300 },
  { name: 'Wed', clicks: 600 },
  { name: 'Thu', clicks: 800 },
  { name: 'Fri', clicks: 500 },
  { name: 'Sat', clicks: 900 },
  { name: 'Sun', clicks: 700 },
];

export const MOCK_CAMPAIGNS = [
  { id: '1', name: 'Summer Savings', status: 'Active', leads: 1200, conversion: 3.5, lastUpdated: '2h ago' },
  { id: '2', name: 'Home Loan Pro', status: 'Active', leads: 850, conversion: 4.2, lastUpdated: '5h ago' },
  { id: '3', name: 'Credit Card Launch', status: 'Draft', leads: 0, conversion: 0, lastUpdated: '1d ago' },
  { id: '4', name: 'Retirement Plan', status: 'Completed', leads: 2300, conversion: 5.1, lastUpdated: '3d ago' },
];

export const MOCK_LEADS = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', score: 85, status: 'Hot', source: 'LinkedIn' },
  { id: '2', name: 'Bob Johnson', email: 'bob@example.com', score: 62, status: 'Warm', source: 'Google Ads' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', score: 45, status: 'Cold', source: 'Referral' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', score: 92, status: 'Hot', source: 'Organic Search' },
];

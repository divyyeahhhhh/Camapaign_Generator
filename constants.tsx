
import React from 'react';
import { Upload, Sparkles, Shield, Target, CheckCircle, Download, Cpu, ShieldCheck, CreditCard, Zap, BarChart3, Globe } from 'lucide-react';

export const COLORS = {
  primary: '#F97316',
  white: '#FFFFFF',
  gray: '#F3F4F6',
  text: '#111827'
};

export const FEATURES = [
  {
    title: "Easy CSV Upload",
    description: "Upload your customer data in CSV format with up to 100 rows at once",
    icon: <Upload className="w-6 h-6 text-[#F97316]" />
  },
  {
    title: "AI-Powered Generation",
    description: "Generate personalized marketing messages using advanced AI technology",
    icon: <Sparkles className="w-6 h-6 text-[#F97316]" />
  },
  {
    title: "Compliance First",
    description: "Automatic compliance checking for BFSI regulations and guidelines",
    icon: <Shield className="w-6 h-6 text-[#F97316]" />
  },
  {
    title: "Targeted Messaging",
    description: "Customize tone and audience targeting for maximum engagement",
    icon: <Target className="w-6 h-6 text-[#F97316]" />
  },
  {
    title: "Review & Approve",
    description: "Review all generated content before finalizing your campaign",
    icon: <CheckCircle className="w-6 h-6 text-[#F97316]" />
  },
  {
    title: "Export Results",
    description: "Download your approved campaigns as CSV or Excel files",
    icon: <Download className="w-6 h-6 text-[#F97316]" />
  }
];

export const PRICING_PLANS = [
  {
    name: "Starter",
    price: "0",
    description: "For individual marketers exploring AI strategy.",
    features: ["100 Campaigns/mo", "Basic Logic Engine", "Standard Compliance Check", "Community Support"],
    cta: "Start Free",
    featured: false
  },
  {
    name: "Professional",
    price: "199",
    description: "For growth-stage teams demanding precision.",
    features: ["Unlimited Campaigns", "Advanced Reasoning Hub", "Full Compliance Audit", "Priority API Access", "Custom Brand Voice"],
    cta: "Go Pro",
    featured: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Scale-ready infrastructure for large institutions.",
    features: ["On-Premise Options", "Dedicated AI Strategist", "Custom Compliance Rules", "SLA Guarantee", "White-label Exports"],
    cta: "Contact Sales",
    featured: false
  }
];

export const TESTIMONIALS = [
  {
    quote: "The speed at which we can now iterate on compliant financial offers is staggering. What took weeks now takes minutes.",
    author: "Sarah Jenkins",
    role: "VP of Marketing, Global Finance Corp"
  },
  {
    quote: "The Explainable AI feature is the game changer. Our legal team actually trusts the output because they can see the logic.",
    author: "Marcus Chen",
    role: "Head of Digital, InsureSafe"
  }
];

export const FAQ = [
  {
    q: "How does the AI ensure BFSI compliance?",
    a: "We use a multi-layered verification process that checks content against current regulatory datasets for promissory language and risk disclosure requirements."
  },
  {
    q: "Can I use my own brand guidelines?",
    a: "Yes. Professional and Enterprise plans allow you to inject specific brand voice attributes and forbidden keyword lists into the reasoning engine."
  },
  {
    q: "What data formats are supported?",
    a: "We currently support CSV, XLSX, and direct JSON ingestion. Direct CRM API integration is available for Enterprise clients."
  }
];

export const PROCESS_STEPS = [
  { number: 1, title: "Upload CSV", desc: "Upload your customer data file" },
  { number: 2, title: "Configure", desc: "Set campaign parameters and tone" },
  { number: 3, title: "Review", desc: "Review and approve generated content" },
  { number: 4, title: "Download", desc: "Export your campaign results" }
];

export const STATS = [
  { label: "Campaigns Generated", value: "10,000+" },
  { label: "Compliance Rate", value: "99.8%" },
  { label: "Time Saved", value: "85%" }
];

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
  { id: '1', name: 'Wealth Builder 2024', status: 'Active', leads: 1200, conversion: 3.5, lastUpdated: '2h ago' },
  { id: '2', name: 'Home Equity Flex', status: 'Active', leads: 850, conversion: 4.2, lastUpdated: '5h ago' },
];

export const MOCK_LEADS = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', score: 85, status: 'Hot', source: 'LinkedIn' },
  { id: '2', name: 'Bob Johnson', email: 'bob@example.com', score: 62, status: 'Warm', source: 'Google Ads' },
];

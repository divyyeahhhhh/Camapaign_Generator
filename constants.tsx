
import React from 'react';
import { Upload, Cpu, ShieldCheck, Target, CheckCircle, Download, CreditCard, Zap, BarChart3, Globe } from 'lucide-react';

export const COLORS = {
  primary: '#F97316',
  white: '#FFFFFF',
  gray: '#F3F4F6',
  text: '#111827'
};

export const FEATURES = [
  {
    title: "Precision Data Ingestion",
    description: "Seamlessly process raw CSV/XLSX audience data. Our engine automatically identifies key demographic levers.",
    icon: <Upload className="w-6 h-6 text-orange-primary" />
  },
  {
    title: "Gemini 3 Reasoning",
    description: "Go beyond simple templates. Our AI reasons through customer financial behavior to craft unique narratives.",
    icon: <Cpu className="w-6 h-6 text-orange-primary" />
  },
  {
    title: "Compliance-First Logic",
    description: "Automated BFSI regulation guardrails ensure every word aligns with institutional safety standards.",
    icon: <ShieldCheck className="w-6 h-6 text-orange-primary" />
  },
  {
    title: "Psychographic Targeting",
    description: "Leverage deep-learning hooks that align with specific life stages—from college loans to retirement planning.",
    icon: <Target className="w-6 h-6 text-orange-primary" />
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
  { number: 1, title: "Upload Brief", desc: "Import your audience metadata" },
  { number: 2, title: "Set Directive", desc: "Define objective and brand tone" },
  { number: 3, title: "AI Synthesis", desc: "Generate reasoned solutions" },
  { number: 4, title: "Deploy", desc: "Export compliant assets" }
];

export const STATS = [
  { label: "Solutions Generated", value: "250,000+" },
  { label: "Safety Accuracy", value: "99.9%" },
  { label: "Agency Time Saved", value: "92%" }
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

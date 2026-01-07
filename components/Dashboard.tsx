
import React from 'react';
import { 
  Crown, 
  FileText, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-[1440px] mx-auto px-10 py-12 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="mb-12">
        <h1 className="text-[40px] font-extrabold text-[#0F172A] mb-2 tracking-tight">Welcome back, Divya Sivakumar!</h1>
        <p className="text-[18px] text-[#64748B] font-medium">Here's an overview of your account and usage statistics.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Current Plan Card */}
        <div className="bg-white p-8 rounded-[1.25rem] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col h-[280px]">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-[20px] font-bold text-[#0F172A]">Current Plan</h3>
            <Crown size={24} className="text-[#F97316]" />
          </div>
          <div className="flex-1 flex items-start">
            <span className="px-5 py-2 bg-[#F1F5F9] rounded-full text-[14px] font-bold text-[#334155]">Free</span>
          </div>
          <button className="w-full py-4 px-4 border border-gray-200 rounded-xl text-[16px] font-bold text-[#1E293B] hover:bg-gray-50 transition-all flex items-center justify-center gap-2 mt-auto">
            Upgrade Plan <ArrowRight size={18} />
          </button>
        </div>

        {/* Campaigns Usage Card */}
        <div className="bg-white p-8 rounded-[1.25rem] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] h-[280px]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[20px] font-bold text-[#0F172A]">Campaigns</h3>
            <FileText size={24} className="text-[#F97316]" />
          </div>
          <p className="text-[15px] text-[#64748B] font-medium mb-10">This billing period</p>
          <div className="flex justify-between items-end mb-3">
            <span className="text-[36px] font-bold text-[#0F172A] leading-none">0</span>
            <span className="text-[16px] text-[#64748B] font-medium mb-1">of 100</span>
          </div>
          <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div className="h-full bg-[#E2E8F0] w-1 rounded-full"></div>
          </div>
        </div>

        {/* Rows Processed Card */}
        <div className="bg-white p-8 rounded-[1.25rem] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] h-[280px]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[20px] font-bold text-[#0F172A]">Rows Processed</h3>
            <TrendingUp size={24} className="text-[#F97316]" />
          </div>
          <p className="text-[15px] text-[#64748B] font-medium mb-10">This billing period</p>
          <div className="flex justify-between items-end mb-3">
            <span className="text-[36px] font-bold text-[#0F172A] leading-none">0</span>
            <span className="text-[16px] text-[#64748B] font-medium mb-1">of 1,000</span>
          </div>
          <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div className="h-full bg-[#E2E8F0] w-1 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-16">
        <h3 className="text-[28px] font-bold text-[#0F172A] mb-1 tracking-tight">Quick Actions</h3>
        <p className="text-[18px] text-[#64748B] font-medium mb-8">Get started with your campaign generation</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => onNavigate(AppView.CREATE_CAMPAIGN)}
            className="flex items-center gap-8 p-10 bg-white border border-gray-100 rounded-[1.25rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-orange-100 transition-all text-left group"
          >
            <div className="w-16 h-16 bg-[#FFF7ED] rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles size={32} className="text-[#F97316]" />
            </div>
            <div>
              <h4 className="text-[20px] font-bold text-[#0F172A] mb-1">Create New Campaign</h4>
              <p className="text-[16px] text-[#64748B] font-medium">Upload CSV and generate personalized messages</p>
            </div>
          </button>

          <button className="flex items-center gap-8 p-10 bg-white border border-gray-100 rounded-[1.25rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-orange-100 transition-all text-left group">
            <div className="w-16 h-16 bg-[#F5F3FF] rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Crown size={32} className="text-[#8B5CF6]" />
            </div>
            <div>
              <h4 className="text-[20px] font-bold text-[#0F172A] mb-1">View Pricing Plans</h4>
              <p className="text-[16px] text-[#64748B] font-medium">Upgrade for more campaigns and features</p>
            </div>
          </button>
        </div>
      </div>

      {/* Plan Includes Section */}
      <div className="pt-12 border-t border-gray-100">
        <h3 className="text-[32px] font-bold text-[#0F172A] mb-2 tracking-tight">Your Plan Includes</h3>
        <p className="text-[18px] text-[#64748B] font-medium mb-12">Features available in your current plan</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
          {[
            "100 campaigns per month",
            "Up to 10 rows per campaign",
            "Basic templates",
            "Email support"
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-6 h-6 bg-[#F0FDF4] rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} className="text-[#22C55E]" />
              </div>
              <span className="text-[18px] font-medium text-[#334155]">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Added missing default export
export default Dashboard;

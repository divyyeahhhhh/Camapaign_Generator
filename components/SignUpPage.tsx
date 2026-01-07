
import React, { useState } from 'react';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface SignUpPageProps {
  onSignUp: () => void;
  onSwitchToLogin: () => void;
  onBackToLanding: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onSwitchToLogin, onBackToLanding }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignUp();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Header */}
      <header className="w-full px-10 py-5 flex items-center bg-white border-b border-gray-100">
        <div className="flex items-center gap-6 cursor-pointer h-full" onClick={onBackToLanding}>
          <BrandLogo className="scale-90 origin-left" />
          <div className="h-6 w-[1.5px] bg-gray-200 hidden sm:block"></div>
          <span className="font-bold text-[16px] tracking-tight text-[#1E293B] hidden sm:block mt-0.5 whitespace-nowrap">
            BFSI Campaign Generator
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-[480px] bg-white rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="p-10 flex flex-col items-center">
            <BrandLogo className="mb-8 scale-110" />
            
            <h2 className="text-[21px] font-bold text-gray-900 mb-1 tracking-tight">Create your account</h2>
            <p className="text-[15px] text-gray-500 mb-10 font-medium">Welcome! Please fill in the details to get started.</p>

            <form onSubmit={handleSubmit} className="w-full space-y-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-semibold text-gray-700">First name</label>
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-tighter">Optional</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="First name"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-gray-500 focus:ring-0 outline-none transition-all font-medium text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-semibold text-gray-700">Last name</label>
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-tighter">Optional</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Last name"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-gray-500 focus:ring-0 outline-none transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email address</label>
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-gray-500 focus:ring-0 outline-none transition-all font-medium text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-gray-500 focus:ring-0 outline-none transition-all font-medium text-gray-900 pr-12"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#334155] text-white rounded-xl font-bold text-sm hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2 mt-4 shadow-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Continue <ChevronRight size={14} className="mt-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="px-10 py-5 bg-[#F8FAFC] border-t border-gray-100 text-center">
            <p className="text-[14px] text-gray-500 font-medium">
              Already have an account? <button onClick={onSwitchToLogin} className="text-gray-900 font-bold hover:underline">Sign in</button>
            </p>
          </div>

          <div className="p-5 bg-gray-50/50 flex flex-col items-center gap-2 border-t border-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }}></div>
            <div className="flex items-center gap-1.5 z-10">
              <span className="text-[10px] font-bold text-gray-400">Secured by</span>
              <div className="flex items-center gap-1 opacity-80">
                <div className="w-3.5 h-3.5 bg-gray-500 rounded-sm flex items-center justify-center text-[9px] text-white font-black">C</div>
                <span className="text-[10px] font-bold text-gray-700">clerk</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-wide z-10">Development mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

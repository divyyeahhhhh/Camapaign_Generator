
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface LoginPageProps {
  onLogin: () => void;
  onSwitchToSignUp: () => void;
  onBackToLanding: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToSignUp, onBackToLanding }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
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
      <div className="flex-1 flex items-center justify-center p-6 pb-20">
        <div className="w-full max-w-[430px] bg-white rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="p-10 flex flex-col items-center">
            <BrandLogo className="mb-8 scale-110" />
            
            <h2 className="text-[21px] font-bold text-gray-900 mb-1 tracking-tight">Sign in to Campaign Generator</h2>
            <p className="text-[15px] text-gray-500 mb-10 font-medium">Welcome back! Please sign in to continue</p>

            <form onSubmit={handleSubmit} className="w-full space-y-8">
              <div className="space-y-2 text-left">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-gray-500 focus:ring-0 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#334155] text-white rounded-xl font-bold text-sm hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2"
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
              Don't have an account? <button onClick={onSwitchToSignUp} className="text-gray-900 font-bold hover:underline">Sign up</button>
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

export default LoginPage;

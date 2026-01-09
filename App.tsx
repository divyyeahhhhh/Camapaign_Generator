
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Settings,
  LogOut,
  Check,
  Star,
  ChevronDown,
  Sparkles,
  BarChart3,
  User
} from 'lucide-react';
import { FEATURES, PROCESS_STEPS, STATS, PRICING_PLANS, TESTIMONIALS, FAQ } from './constants.tsx';
import { AppView, AuthMode } from './types.ts';
import CreateCampaign from './components/CreateCampaign.tsx';
import ContactUs from './components/ContactUs.tsx';
import AccountModal from './components/AccountModal.tsx';
import LoginPage from './components/LoginPage.tsx';
import SignUpPage from './components/SignUpPage.tsx';
import BrandLogo from './components/BrandLogo.tsx';
import Dashboard from './components/Dashboard.tsx';
import { DemoTour, DemoStep } from './components/DemoTour.tsx';

const StatCounter: React.FC<{ value: string, label: string }> = ({ value, label }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.]/g, '');

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasStarted) setHasStarted(true);
    }, { threshold: 0.5 });
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTimestamp: number | null = null;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(progress * numericValue);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [hasStarted, numericValue]);

  return (
    <div ref={elementRef} className="flex flex-col items-center">
      <div className="text-[44px] font-black text-[#F97316] mb-1">
        {value.includes('.') ? count.toFixed(1) : Math.floor(count).toLocaleString()}{suffix}
      </div>
      <div className="text-[14px] font-medium text-gray-500">{label}</div>
    </div>
  );
};

const Navbar = ({ 
  isAuthenticated, 
  onNavigate, 
  onManageAccount, 
  onLogout,
  onLoginClick,
  currentView
}: any) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-[1440px] mx-auto px-10 flex justify-between items-center">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate(AppView.HOME)}>
          <BrandLogo />
          <span className="text-[18px] font-bold text-gray-900 border-l border-gray-200 pl-4 h-6 flex items-center">
            BFSI Campaign Generator
          </span>
        </div>
        
        <div className="flex items-center gap-8">
          <button onClick={() => onNavigate(AppView.CONTACT_US)} className="text-[15px] font-bold text-gray-800 hover:text-orange-primary transition-colors">
            Contact Us
          </button>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate(AppView.DASHBOARD)} 
                className={`px-6 py-2 border rounded-lg font-bold text-[15px] transition-all ${currentView === AppView.DASHBOARD ? 'bg-[#F97316] text-white border-[#F97316]' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}
              >
                Dashboard
              </button>
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)} 
                  className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#F97316] hover:bg-orange-200 transition-all"
                >
                  <User size={20} />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => { onManageAccount(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"><Settings size={16} /> Account Settings</button>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"><LogOut size={16} /> Log Out</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="px-6 py-2 border border-gray-200 rounded-lg font-bold text-[15px] text-gray-800 hover:bg-gray-50 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('landing');
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState<DemoStep>(DemoStep.IDLE);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [intendedView, setIntendedView] = useState<AppView | null>(null);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setAuthMode('landing');
    if (intendedView) {
      setCurrentView(intendedView);
      setIntendedView(null);
    } else {
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const handleCreateCampaignRequest = () => {
    if (!isAuthenticated) {
      setIntendedView(AppView.CREATE_CAMPAIGN);
      setAuthMode('login');
    } else {
      setCurrentView(AppView.CREATE_CAMPAIGN);
    }
  };

  if (!isAuthenticated && authMode === 'login') return <LoginPage onLogin={handleLoginSuccess} onSwitchToSignUp={() => setAuthMode('signup')} onBackToLanding={() => setAuthMode('landing')} />;
  if (!isAuthenticated && authMode === 'signup') return <SignUpPage onSignUp={handleLoginSuccess} onSwitchToLogin={() => setAuthMode('login')} onBackToLanding={() => setAuthMode('landing')} />;

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        isAuthenticated={isAuthenticated}
        onNavigate={(view: AppView) => {
          if (view === AppView.CREATE_CAMPAIGN) handleCreateCampaignRequest();
          else setCurrentView(view);
        }} 
        onManageAccount={() => setIsAccountModalOpen(true)} 
        onLogout={() => { setIsAuthenticated(false); setCurrentView(AppView.HOME); }}
        onLoginClick={() => setAuthMode('login')}
        currentView={currentView}
      />
      
      {currentView === AppView.HOME && (
        <div className="animate-in fade-in duration-700">
          <section className="relative pt-44 pb-24 overflow-hidden bg-white">
            <div className="max-w-[1440px] mx-auto px-10 text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 mb-8">
                <Sparkles size={14} className="text-gray-600" />
                <span className="text-[12px] font-bold text-gray-800">Powered by AI</span>
              </div>
              
              <h1 className="text-[72px] font-bold text-[#F97316] leading-[1.1] tracking-tight mb-8 max-w-5xl mx-auto">
                Create Compliant Marketing <br/> Campaigns in Minutes
              </h1>
              
              <p className="text-[20px] text-[#475569] max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                Generate personalized, compliance-checked marketing messages for your BFSI customers using AI. Upload your data, customize your message, and download ready-to-use campaigns.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24">
                <button 
                  onClick={handleCreateCampaignRequest} 
                  className="px-8 py-4 bg-[#F97316] text-white rounded-lg font-bold text-[18px] hover:bg-[#EA580C] transition-all flex items-center gap-3 shadow-lg shadow-orange-200"
                >
                  <Sparkles size={20} /> Create Campaign
                </button>
                <button 
                  onClick={() => {setIsDemoActive(true); setDemoStep(DemoStep.INTRO);}} 
                  className="px-8 py-4 bg-white border border-gray-200 text-[#0F172A] rounded-lg font-bold text-[18px] hover:bg-gray-50 transition-all flex items-center gap-3"
                >
                  <BarChart3 size={20} /> View Demo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-4xl mx-auto">
                {STATS.map((stat, idx) => <StatCounter key={idx} value={stat.value} label={stat.label} />)}
              </div>
            </div>
          </section>

          <section id="features" className="py-24 bg-white">
            <div className="max-w-[1440px] mx-auto px-10">
              <div className="text-center mb-20">
                <h2 className="text-[48px] font-bold text-[#0F172A] mb-4">
                  Everything You Need for <span className="text-[#F97316]">Compliant Marketing</span>
                </h2>
                <p className="text-[18px] text-gray-600 font-medium">Our platform handles the entire workflow from data upload to campaign delivery</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {FEATURES.map((feature, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start">
                    <div className="w-12 h-12 bg-[#FFF7ED] rounded-lg flex items-center justify-center mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-[22px] font-bold text-[#0F172A] mb-3 tracking-tight">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed font-medium text-[15px]">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-24 bg-[#F8FAFC]">
            <div className="max-w-[1440px] mx-auto px-10">
              <div className="text-center mb-16">
                <h2 className="text-[48px] font-bold text-[#0F172A] mb-4">Simple 4-Step Process</h2>
                <p className="text-[18px] text-gray-600 font-medium">From data to campaign in just a few clicks</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {PROCESS_STEPS.map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className="w-[72px] h-[72px] bg-[#F97316] text-white rounded-full flex items-center justify-center text-[28px] font-bold mb-6 shadow-lg shadow-orange-100">
                      {step.number}
                    </div>
                    <h3 className="text-[20px] font-bold text-[#0F172A] mb-2">{step.title}</h3>
                    <p className="text-[16px] text-gray-500 font-medium">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-24 bg-white">
            <div className="max-w-[1100px] mx-auto px-10">
              <div className="bg-[#F97316] rounded-2xl p-20 text-center flex flex-col items-center shadow-xl">
                <h2 className="text-[44px] font-bold text-[#0F172A] mb-4">Ready to Transform Your Marketing?</h2>
                <p className="text-[18px] text-white font-medium mb-12">
                  Join thousands of financial institutions using AI-powered campaign generation
                </p>
                <button 
                  onClick={handleCreateCampaignRequest}
                  className="bg-white text-[#0F172A] px-10 py-4 rounded-lg font-bold text-[18px] flex items-center gap-3 hover:bg-gray-50 transition-all shadow-lg"
                >
                  Get Started Now <Sparkles size={20} className="text-[#F97316]" />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {currentView === AppView.DASHBOARD && isAuthenticated && <div className="pt-24"><Dashboard onNavigate={setCurrentView} /></div>}
      {currentView === AppView.CREATE_CAMPAIGN && <div className="pt-24"><CreateCampaign onBack={() => setCurrentView(isAuthenticated ? AppView.DASHBOARD : AppView.HOME)} /></div>}
      {currentView === AppView.CONTACT_US && <ContactUs onBack={() => setCurrentView(isAuthenticated ? AppView.DASHBOARD : AppView.HOME)} />}
      
      <footer className="bg-[#0F172A] pt-32 pb-16 mt-20">
        <div className="max-w-[1440px] mx-auto px-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-20 mb-32">
            <div className="max-w-md">
              <BrandLogo className="mb-8 scale-125 origin-left brightness-0 invert" />
              <p className="text-xl text-gray-500 font-medium leading-relaxed">The world's leading strategic reasoning engine for high-stakes financial marketing.</p>
            </div>
          </div>
          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs font-black text-gray-600 uppercase tracking-widest">© 2025 Newgen Digitalworks. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {isAccountModalOpen && <AccountModal onClose={() => setIsAccountModalOpen(false)} />}
      {isDemoActive && <DemoTour isDemoActive={isDemoActive} currentStep={demoStep} setDemoStep={setDemoStep} onClose={() => setIsDemoActive(false)} />}
    </div>
  );
};

export default App;

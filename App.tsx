
import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings,
  LogOut,
  Sparkles,
  BarChart3,
  User,
  ArrowRight
} from 'lucide-react';
import { FEATURES, PROCESS_STEPS, STATS, TESTIMONIALS, FAQ } from './constants.tsx';
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

const Navbar = ({ isAuthenticated, onNavigate, onManageAccount, onLogout, onLoginClick, currentView }: any) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1440px] mx-auto px-10 flex justify-between items-center">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate(AppView.HOME)}>
          <BrandLogo />
          <span className="text-[18px] font-bold text-gray-900 border-l border-gray-200 pl-4 h-6 flex items-center tracking-tight">BFSI Campaign Generator</span>
        </div>
        <div className="flex items-center gap-10">
          <button onClick={() => onNavigate(AppView.CONTACT_US)} className="text-[15px] font-bold text-gray-800 hover:text-[#F97316] transition-colors uppercase tracking-widest">Support</button>
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <button onClick={() => onNavigate(AppView.DASHBOARD)} className={`px-6 py-2.5 border rounded-xl font-bold text-[14px] uppercase tracking-widest transition-all ${currentView === AppView.DASHBOARD ? 'bg-[#F97316] text-white border-[#F97316]' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}>Dashboard</button>
              <div className="relative">
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-[#F97316] hover:bg-orange-200 transition-all shadow-sm"><User size={22} /></button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => { onManageAccount(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-4 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"><Settings size={18} /> Account Info</button>
                    <button onClick={() => { onLogout(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-4 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"><LogOut size={18} /> Log Out</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={onLoginClick} className="px-8 py-3 bg-[#0F172A] text-white rounded-xl font-bold text-[14px] uppercase tracking-[0.15em] hover:bg-[#1E293B] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-200">Sign In</button>
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
    
    // Use a small delay or immediate check to ensure state is flushed before routing
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
          <section className="relative pt-44 pb-32 overflow-hidden bg-white">
            <div className="max-w-[1440px] mx-auto px-10 text-center relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] mb-10 shadow-sm">
                <Sparkles size={16} className="text-[#F97316]" />
                <span className="text-[13px] font-black text-gray-500 uppercase tracking-[0.2em]">Strategic Personalization Engine</span>
              </div>
              <h1 className="text-[92px] font-black text-[#0F172A] leading-[0.95] tracking-[-0.05em] mb-12 max-w-6xl mx-auto">
                <span className="text-[#F97316]">Compliant</span> Marketing <br/> In Minutes.
              </h1>
              <p className="text-[22px] text-gray-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
                Empower your BFSI institution with automated strategic reasoning. Personalize at scale while maintaining rigorous regulatory adherence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32">
                <button onClick={handleCreateCampaignRequest} className="px-10 py-5 bg-[#F97316] text-white rounded-2xl font-black text-[18px] uppercase tracking-widest hover:bg-[#EA580C] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-orange-100 flex items-center gap-4">
                  <Sparkles size={22} /> Create Campaign
                </button>
                <button onClick={() => {setIsDemoActive(true); setDemoStep(DemoStep.INTRO);}} className="px-10 py-5 bg-white border-2 border-gray-100 text-[#0F172A] rounded-2xl font-black text-[18px] uppercase tracking-widest hover:border-[#F97316] hover:text-[#F97316] transition-all flex items-center gap-4">
                  <BarChart3 size={22} /> View Demo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-24 max-w-5xl mx-auto border-t border-gray-100 pt-24">
                {STATS.map((stat, idx) => <StatCounter key={idx} value={stat.value} label={stat.label} />)}
              </div>
            </div>
          </section>

          <section id="features" className="py-32 bg-[#F8FAFC]">
            <div className="max-w-[1440px] mx-auto px-10">
              <div className="text-center mb-24">
                <h2 className="text-[56px] font-black text-[#0F172A] mb-4 tracking-tight leading-none">High-Stakes <span className="text-[#F97316]">Capabilities</span></h2>
                <p className="text-[20px] text-gray-400 font-medium">Enterprise-grade tools for financial marketing precision.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {FEATURES.map((feature, idx) => (
                  <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#F97316] transition-colors">
                      {/* Fixed: Use 'as any' to allow className injection through cloneElement for dynamic styling */}
                      {React.cloneElement(feature.icon as any, { className: "w-8 h-8 text-[#F97316] group-hover:text-white transition-colors" })}
                    </div>
                    <h3 className="text-[24px] font-black text-[#0F172A] mb-4 tracking-tight">{feature.title}</h3>
                    <p className="text-gray-500 font-medium text-[16px] leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-40 bg-white">
            <div className="max-w-[1200px] mx-auto px-10">
              <div className="bg-[#0F172A] rounded-[3rem] p-24 text-center flex flex-col items-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -ml-20 -mt-20"></div>
                <h2 className="text-[64px] font-black text-white mb-6 leading-none tracking-tight relative z-10">Ready to Scale?</h2>
                <p className="text-[22px] text-gray-400 font-medium mb-16 max-w-2xl relative z-10">
                  Automate the complex intersection of finance and creative copy with our Strategic Reasoning Hub.
                </p>
                <button onClick={handleCreateCampaignRequest} className="bg-white text-[#0F172A] px-12 py-5 rounded-2xl font-black text-[18px] uppercase tracking-[0.2em] hover:bg-[#F97316] hover:text-white transition-all shadow-2xl relative z-10">Get Started Now</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {currentView === AppView.DASHBOARD && isAuthenticated && <div className="pt-24"><Dashboard onNavigate={setCurrentView} /></div>}
      {currentView === AppView.CREATE_CAMPAIGN && <div className="pt-24"><CreateCampaign onBack={() => setCurrentView(isAuthenticated ? AppView.DASHBOARD : AppView.HOME)} /></div>}
      {currentView === AppView.CONTACT_US && <ContactUs onBack={() => setCurrentView(isAuthenticated ? AppView.DASHBOARD : AppView.HOME)} />}
      
      <footer className="bg-[#0F172A] pt-40 pb-20">
        <div className="max-w-[1440px] mx-auto px-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12 border-t border-white/5 pt-20">
            <BrandLogo className="brightness-0 invert opacity-40 scale-125" />
            <div className="flex gap-12">
               {['Strategy', 'Ethics', 'Legal', 'Privacy'].map(l => <a key={l} href="#" className="text-[12px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors">{l}</a>)}
            </div>
            <p className="text-[12px] font-black text-gray-600 uppercase tracking-[0.3em]">© 2025 Newgen Digitalworks.</p>
          </div>
        </div>
      </footer>

      {isAccountModalOpen && <AccountModal onClose={() => setIsAccountModalOpen(false)} />}
      {isDemoActive && <DemoTour isDemoActive={isDemoActive} currentStep={demoStep} setDemoStep={setDemoStep} onClose={() => setIsDemoActive(false)} />}
    </div>
  );
};

export default App;

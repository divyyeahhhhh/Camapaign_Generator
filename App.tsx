
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  PlayCircle, 
  ChevronRight, 
  Menu, 
  X,
  User,
  Settings,
  LogOut,
  Plus
} from 'lucide-react';
import { FEATURES, PROCESS_STEPS, STATS } from './constants';
import { AppView, AuthMode } from './types';
import CreateCampaign from './components/CreateCampaign';
import ContactUs from './components/ContactUs';
import AccountModal from './components/AccountModal';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import BrandLogo from './components/BrandLogo';
import Dashboard from './components/Dashboard';
import { DemoTour, DemoStep } from './components/DemoTour';

const StatCounter: React.FC<{ value: string, label: string }> = ({ value, label }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const numericValue = parseFloat(value.replace(/,/g, ''));
  const suffix = value.match(/[^0-9.]+/g)?.join('') || '';
  const isDecimal = value.includes('.');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTimestamp: number | null = null;
    const duration = 2000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easedProgress * numericValue);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [hasStarted, numericValue]);

  const formattedCount = isDecimal 
    ? count.toFixed(1) 
    : Math.floor(count).toLocaleString();

  return (
    <div ref={elementRef} className="flex flex-col items-center">
      <span className="text-4xl font-extrabold text-orange-primary mb-1 tracking-tight">
        {formattedCount}{suffix}
      </span>
      <span className="text-sm font-medium text-gray-500 uppercase tracking-widest text-center">{label}</span>
    </div>
  );
};

const Navbar = ({ 
  isAuthenticated, 
  onNavigate, 
  onManageAccount, 
  onLogout,
  onLoginClick,
  onSignUpClick,
  currentView
}: { 
  isAuthenticated: boolean, 
  onNavigate: (view: AppView) => void, 
  onManageAccount?: () => void, 
  onLogout?: () => void,
  onLoginClick?: () => void,
  onSignUpClick?: () => void,
  currentView: AppView
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-sm py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-[1440px] mx-auto px-10 flex justify-between items-center h-14">
        <div className="flex items-center gap-6 cursor-pointer h-full" onClick={() => onNavigate(isAuthenticated ? AppView.DASHBOARD : AppView.HOME)}>
          <BrandLogo />
          <div className="h-6 w-[1.5px] bg-gray-200 hidden sm:block"></div>
          <span className="font-bold text-[16px] tracking-tight text-[#1E293B] hidden sm:block mt-0.5 whitespace-nowrap">
            BFSI Campaign Generator
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 h-full">
          {isAuthenticated ? (
            <div className="flex items-center gap-8">
              <button 
                onClick={() => onNavigate(AppView.DASHBOARD)}
                className={`text-[16px] font-bold transition-colors ${currentView === AppView.DASHBOARD ? 'text-[#F97316]' : 'text-[#64748B] hover:text-black'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => onNavigate(AppView.CREATE_CAMPAIGN)}
                className="h-11 px-6 bg-[#F97316] text-white rounded-xl text-[16px] font-bold hover:bg-[#EA580C] transition-all flex items-center justify-center"
              >
                Create Campaign
              </button>
              
              <div className="relative" ref={profileRef}>
                <div 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-black border border-gray-200 cursor-pointer hover:border-black transition-colors overflow-hidden"
                >
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" className="w-full h-full object-cover" alt="Profile" />
                </div>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-sm overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" className="w-full h-full object-cover" alt="Profile" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 leading-none">Divya Sivakumar</span>
                        <span className="text-[11px] text-gray-500 mt-1 truncate max-w-[160px]">divyashivakumar2003@gmail.com</span>
                      </div>
                    </div>
                    <div className="h-px bg-gray-100 mx-4"></div>
                    <div className="p-2">
                      <button onClick={() => { onManageAccount?.(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                        <Settings size={18} className="text-gray-400" />
                        <span className="font-medium">Manage account</span>
                      </button>
                      <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                        <LogOut size={18} className="text-gray-400" />
                        <span className="font-medium">Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6 h-full">
              <button 
                onClick={() => onNavigate(AppView.CONTACT_US)} 
                className="text-[18px] font-bold text-[#334155] hover:text-orange-primary transition-colors px-2"
              >
                Contact Us
              </button>
              <button 
                onClick={onLoginClick}
                className="h-11 px-8 bg-white border border-gray-200 rounded-xl text-[18px] font-bold text-[#334155] hover:bg-gray-50 transition-all shadow-sm"
              >
                Login
              </button>
              <button 
                onClick={onSignUpClick}
                className="h-11 px-8 bg-[#F97316] text-white rounded-xl text-[18px] font-bold hover:bg-[#EA580C] transition-all"
              >
                Sign Up Free
              </button>
            </div>
          )}
        </div>
        
        <button className="md:hidden text-gray-900">
          <Menu />
        </button>
      </div>
    </nav>
  );
};

const Hero = ({ onNavigate, onDemo }: { onNavigate: (view: AppView) => void, onDemo: () => void }) => (
  <section className="relative pt-32 pb-20 overflow-hidden bg-white">
    <div className="max-w-[1440px] mx-auto px-10 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-8 animate-fade-in">
        <span className="flex h-2 w-2 rounded-full bg-orange-primary animate-pulse"></span>
        <span className="text-xs font-bold text-orange-primary uppercase tracking-wider">Powered by Gemini 3 AI</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 max-w-4xl mx-auto tracking-tight">
        Create <span className="text-orange-primary">Compliant Marketing</span> Campaigns in Minutes
      </h1>
      
      <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
        Generate personalized, compliance-checked marketing messages for your BFSI customers using AI. Upload data, customize, and download.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
        <button 
          onClick={() => onNavigate(AppView.CREATE_CAMPAIGN)}
          className="w-full sm:w-auto px-8 py-4 bg-orange-primary text-white rounded-xl font-bold text-lg shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Create Campaign <ArrowRight size={20} />
        </button>
        <button 
          onClick={onDemo}
          className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <PlayCircle size={20} className="text-orange-primary" /> View Demo
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-gray-100">
        {STATS.map((stat, idx) => (
          <StatCounter key={idx} value={stat.value} label={stat.label} />
        ))}
      </div>
    </div>
  </section>
);

const Features = () => (
  <section className="py-24 bg-gray-50/50">
    <div className="max-w-[1440px] mx-auto px-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Everything You Need for Compliant Marketing</h2>
        <div className="w-20 h-1.5 bg-orange-primary mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FEATURES.map((feature, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-primary transition-colors duration-300">
              <div className="group-hover:text-white transition-colors duration-300">
                {feature.icon}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Process = () => (
  <section className="py-24 bg-white overflow-hidden">
    <div className="max-w-[1440px] mx-auto px-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Simple 4-Step Process</h2>
        <p className="text-gray-500">From raw data to ready-to-launch campaigns in minutes.</p>
      </div>
      
      <div className="relative">
        <div className="hidden lg:block absolute top-10 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {PROCESS_STEPS.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-primary text-white rounded-full flex items-center justify-center text-3xl font-extrabold mb-6 shadow-lg shadow-orange-200 border-8 border-white">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Footer = ({ onNavigate, isAuthenticated }: { onNavigate: (view: AppView) => void, isAuthenticated: boolean }) => (
  <footer className="bg-white pt-10 pb-20">
    <div className="max-w-[1440px] mx-auto px-10">
      <div className="bg-orange-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 relative z-10">
          Ready to Transform Your Marketing?
        </h2>
        <button 
          onClick={() => onNavigate(AppView.CREATE_CAMPAIGN)}
          className="px-10 py-5 bg-white text-gray-900 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl relative z-10"
        >
          Get Started Now
        </button>
      </div>
      
      <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <BrandLogo className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all scale-75" />
          <span className="text-gray-300 text-sm">© 2024 Newgen Digitalworks</span>
        </div>
        <div className="flex gap-8">
          <a href="#" className="text-sm text-gray-500 hover:text-orange-primary transition-colors">Privacy Policy</a>
          <a href="#" className="text-sm text-gray-500 hover:text-orange-primary transition-colors">Terms of Service</a>
          <a href="#" className="text-sm text-gray-500 hover:text-orange-primary transition-colors">BFSI Guidelines</a>
        </div>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('landing');
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState<DemoStep>(DemoStep.IDLE);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, authMode]);

  const startDemo = () => {
    setIsDemoActive(true);
    setDemoStep(DemoStep.INTRO);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthMode('landing');
    setCurrentView(AppView.HOME);
    setIsAccountModalOpen(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setAuthMode('landing');
    setCurrentView(AppView.DASHBOARD);
  };

  const handleCreateCampaignRequest = () => {
    if (!isAuthenticated) {
      setAuthMode('login');
    } else {
      setCurrentView(AppView.CREATE_CAMPAIGN);
    }
  };

  if (!isAuthenticated && authMode === 'login') {
    return (
      <LoginPage 
        onLogin={handleLoginSuccess} 
        onSwitchToSignUp={() => setAuthMode('signup')}
        onBackToLanding={() => setAuthMode('landing')}
      />
    );
  }

  if (!isAuthenticated && authMode === 'signup') {
    return (
      <SignUpPage 
        onSignUp={handleLoginSuccess} 
        onSwitchToLogin={() => setAuthMode('login')}
        onBackToLanding={() => setAuthMode('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        isAuthenticated={isAuthenticated}
        onNavigate={(view) => {
          if (view === AppView.CREATE_CAMPAIGN) handleCreateCampaignRequest();
          else setCurrentView(view);
        }} 
        onManageAccount={() => setIsAccountModalOpen(true)} 
        onLogout={handleLogout}
        onLoginClick={() => setAuthMode('login')}
        onSignUpClick={() => setAuthMode('signup')}
        currentView={currentView}
      />
      
      {currentView === AppView.HOME && (
        <>
          <Hero 
            onNavigate={(view) => {
              if (view === AppView.CREATE_CAMPAIGN) handleCreateCampaignRequest();
              else setCurrentView(view);
            }} 
            onDemo={startDemo} 
          />
          <Features />
          <Process />
        </>
      )}

      {currentView === AppView.DASHBOARD && isAuthenticated && (
        <div className="pt-20">
          <Dashboard onNavigate={setCurrentView} />
        </div>
      )}

      {currentView === AppView.CREATE_CAMPAIGN && (
        <div className="pt-20">
          <CreateCampaign 
            onBack={() => { setCurrentView(isAuthenticated ? AppView.DASHBOARD : AppView.HOME); setIsDemoActive(false); }} 
            isDemoMode={isDemoActive}
            demoStep={demoStep}
            setDemoStep={setDemoStep}
          />
        </div>
      )}

      {currentView === AppView.CONTACT_US && (
        <ContactUs onBack={() => setCurrentView(isAuthenticated ? AppView.DASHBOARD : AppView.HOME)} />
      )}
      
      {currentView !== AppView.CONTACT_US && (
        <Footer 
          isAuthenticated={isAuthenticated}
          onNavigate={(view) => {
            if (view === AppView.CREATE_CAMPAIGN) handleCreateCampaignRequest();
            else setCurrentView(view);
          }} 
        />
      )}

      {isAccountModalOpen && (
        <AccountModal onClose={() => setIsAccountModalOpen(false)} />
      )}

      {isDemoActive && (
        <>
          {currentView === AppView.CREATE_CAMPAIGN && (
            <DemoTour 
              isDemoActive={isDemoActive}
              currentStep={demoStep}
              setDemoStep={setDemoStep}
              onClose={() => setIsDemoActive(false)}
            />
          )}
          {currentView === AppView.HOME && demoStep === DemoStep.INTRO && (
            <DemoTour 
              isDemoActive={isDemoActive}
              currentStep={DemoStep.INTRO}
              setDemoStep={(step) => {
                setDemoStep(step);
                if (step === DemoStep.EXPLAIN_UPLOAD) {
                  if (!isAuthenticated) setIsAuthenticated(true);
                  setCurrentView(AppView.CREATE_CAMPAIGN);
                }
              }}
              onClose={() => setIsDemoActive(false)} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;

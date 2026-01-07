
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  PlayCircle, 
  ChevronRight, 
  Menu, 
  X,
  Settings,
  LogOut,
  Check,
  Star,
  ChevronDown,
  MessageSquare,
  Sparkles
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
    <div ref={elementRef} className="text-center group">
      <div className="text-5xl font-black text-[#0F172A] mb-2 group-hover:text-orange-primary transition-colors">
        {Math.floor(count).toLocaleString()}{suffix}
      </div>
      <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{label}</div>
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4 shadow-sm' : 'bg-transparent py-8'
    }`}>
      <div className="max-w-[1440px] mx-auto px-10 flex justify-between items-center">
        <div className="flex items-center gap-8 cursor-pointer group" onClick={() => onNavigate(isAuthenticated ? AppView.DASHBOARD : AppView.HOME)}>
          <BrandLogo className="group-hover:scale-105 transition-transform" />
          <div className="h-4 w-[1px] bg-gray-200 hidden lg:block"></div>
          <span className="hidden lg:block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Institutional Grade AI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          {!isAuthenticated ? (
            <>
              <a href="#features" className="text-sm font-black text-gray-500 hover:text-orange-primary transition-all uppercase tracking-widest">Platform</a>
              <a href="#pricing" className="text-sm font-black text-gray-500 hover:text-orange-primary transition-all uppercase tracking-widest">Solutions</a>
              <button onClick={() => onNavigate(AppView.CONTACT_US)} className="text-sm font-black text-gray-500 hover:text-orange-primary transition-all uppercase tracking-widest">Support</button>
              <div className="w-[1px] h-4 bg-gray-200"></div>
              <button onClick={onLoginClick} className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Login</button>
              <button onClick={onSignUpClick} className="px-8 py-3 bg-orange-primary text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-100">Deploy Now</button>
            </>
          ) : (
            <div className="flex items-center gap-8">
              <button onClick={() => onNavigate(AppView.DASHBOARD)} className={`text-sm font-black uppercase tracking-widest ${currentView === AppView.DASHBOARD ? 'text-orange-primary' : 'text-gray-500'}`}>Workspace</button>
              <button onClick={() => onNavigate(AppView.CREATE_CAMPAIGN)} className="px-6 py-3 bg-[#0F172A] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-primary transition-all">New Campaign</button>
              <div className="relative" ref={profileRef}>
                <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center cursor-pointer overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" className="w-full h-full object-cover" alt="Profile" />
                </div>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button onClick={() => { onManageAccount(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-4 text-xs font-black text-gray-500 hover:bg-gray-50 rounded-xl uppercase tracking-widest transition-colors"><Settings size={16} /> Settings</button>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl uppercase tracking-widest transition-colors"><LogOut size={16} /> Logout</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const Process = () => (
  <section className="py-32 bg-white">
    <div className="max-w-[1440px] mx-auto px-10">
      <div className="text-center mb-20">
        <h2 className="text-[56px] font-black text-[#0F172A] tracking-tighter mb-4">The Logic Cycle</h2>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">Four stages of institutional-grade marketing automation.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {PROCESS_STEPS.map((step, i) => (
          <div key={i} className="relative p-12 bg-gray-50 rounded-[3rem] border border-gray-100 group hover:bg-[#0F172A] transition-all duration-500">
            <div className="text-[80px] font-black text-orange-primary/10 absolute -top-4 right-8 group-hover:text-orange-primary/20 transition-colors">0{step.number}</div>
            <div className="relative z-10">
               <h3 className="text-2xl font-black text-[#0F172A] mb-4 group-hover:text-white transition-colors">{step.title}</h3>
               <p className="text-gray-500 font-medium group-hover:text-gray-400 transition-colors">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Pricing = () => (
  <section id="pricing" className="py-32 bg-white">
    <div className="max-w-[1440px] mx-auto px-10">
      <div className="text-center mb-20">
        <h2 className="text-[56px] font-black text-[#0F172A] tracking-tighter mb-4">Strategic Tiering</h2>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">Scale your compliance engine with our flexible enterprise models.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {PRICING_PLANS.map((plan, i) => (
          <div key={i} className={`p-12 rounded-[3rem] border transition-all ${plan.featured ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-2xl scale-105' : 'bg-gray-50 border-gray-100 text-[#0F172A]'}`}>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 opacity-60">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black">${plan.price}</span>
              {plan.price !== 'Custom' && <span className="text-sm font-black opacity-40">/MO</span>}
            </div>
            <p className="text-sm font-medium mb-10 opacity-70 leading-relaxed">{plan.description}</p>
            <div className="space-y-4 mb-12">
              {plan.features.map((f, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Check size={16} className={plan.featured ? 'text-orange-primary' : 'text-green-500'} />
                  <span className="text-sm font-bold opacity-80">{f}</span>
                </div>
              ))}
            </div>
            <button className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${plan.featured ? 'bg-orange-primary text-white shadow-lg shadow-orange-900/40 hover:bg-white hover:text-[#0F172A]' : 'bg-white border-2 border-gray-200 text-[#0F172A] hover:border-[#0F172A]'}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section className="py-32 bg-[#0F172A] relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"></div>
    <div className="max-w-[1440px] mx-auto px-10 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-[56px] font-black text-white tracking-tighter leading-none mb-8">Trusted by Global Institutions</h2>
          <div className="flex gap-1 mb-10">
            {[1,2,3,4,5].map(s => <Star key={s} size={24} fill="#F97316" className="text-orange-primary" />)}
          </div>
          <p className="text-xl text-gray-400 font-medium leading-relaxed">Join the world's most disciplined marketing teams in automating the complex intersection of finance and creative copy.</p>
        </div>
        <div className="space-y-8">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[2.5rem]">
              <p className="text-2xl font-bold text-white leading-relaxed mb-8 italic">"{t.quote}"</p>
              <div>
                <p className="text-lg font-black text-orange-primary uppercase tracking-widest">{t.author}</p>
                <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section className="py-32 bg-gray-50">
      <div className="max-w-4xl mx-auto px-10">
        <div className="text-center mb-20">
          <h2 className="text-[48px] font-black text-[#0F172A] tracking-tighter">Support & Intelligence</h2>
          <p className="text-lg text-gray-500 font-medium">Deep logic behind the platform's capabilities.</p>
        </div>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full p-8 flex justify-between items-center text-left">
                <span className="text-lg font-black text-[#0F172A] tracking-tight">{item.q}</span>
                <ChevronDown size={24} className={`text-orange-primary transition-transform duration-500 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-gray-500 font-medium leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

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

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setAuthMode('landing');
    setCurrentView(AppView.DASHBOARD);
  };

  const handleCreateCampaignRequest = () => {
    if (!isAuthenticated) setAuthMode('login');
    else setCurrentView(AppView.CREATE_CAMPAIGN);
  };

  if (!isAuthenticated && authMode === 'login') return <LoginPage onLogin={handleLoginSuccess} onSwitchToSignUp={() => setAuthMode('signup')} onBackToLanding={() => setAuthMode('landing')} />;
  if (!isAuthenticated && authMode === 'signup') return <SignUpPage onSignUp={handleLoginSuccess} onSwitchToLogin={() => setAuthMode('login')} onBackToLanding={() => setAuthMode('landing')} />;

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        isAuthenticated={isAuthenticated}
        onNavigate={(view: AppView) => view === AppView.CREATE_CAMPAIGN ? handleCreateCampaignRequest() : setCurrentView(view)} 
        onManageAccount={() => setIsAccountModalOpen(true)} 
        onLogout={() => { setIsAuthenticated(false); setCurrentView(AppView.HOME); }}
        onLoginClick={() => setAuthMode('login')}
        onSignUpClick={() => setAuthMode('signup')}
        currentView={currentView}
      />
      
      {currentView === AppView.HOME && (
        <div className="animate-in fade-in duration-700">
          {/* Hero Section */}
          <section className="relative pt-48 pb-32 overflow-hidden bg-white">
            <div className="max-w-[1440px] mx-auto px-10 text-center relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-orange-50 border border-orange-100 mb-10">
                <Sparkles size={14} className="text-orange-primary" />
                <span className="text-[10px] font-black text-orange-primary uppercase tracking-[0.4em]">Next Gen Strategic Engine</span>
              </div>
              <h1 className="text-[90px] font-black text-[#0F172A] leading-[0.9] tracking-tighter mb-10 max-w-5xl mx-auto">
                AI Intelligence for <br/> <span className="text-orange-primary">BFSI Dominance.</span>
              </h1>
              <p className="text-2xl text-gray-500 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
                Automate complex marketing synthesis. Reason through compliance datasets. Deploy hyper-personalized financial offers in seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
                <button onClick={handleCreateCampaignRequest} className="px-12 py-6 bg-[#0F172A] text-white rounded-[2rem] font-black text-xl hover:bg-orange-primary hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-2xl shadow-gray-200">
                  Execute Strategy <ArrowRight size={24} />
                </button>
                <button onClick={() => {setIsDemoActive(true); setDemoStep(DemoStep.INTRO);}} className="px-12 py-6 bg-white border-2 border-gray-100 text-[#0F172A] rounded-[2rem] font-black text-xl hover:border-black transition-all flex items-center gap-4">
                  <PlayCircle size={24} className="text-orange-primary" /> View Demo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-20 py-20 border-t border-gray-50">
                {STATS.map((stat, idx) => <StatCounter key={idx} value={stat.value} label={stat.label} />)}
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-orange-50/50 blur-[100px] rounded-full -z-10 -mt-64"></div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-32 bg-gray-50/50">
            <div className="max-w-[1440px] mx-auto px-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {FEATURES.map((feature, idx) => (
                  <div key={idx} className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-primary group-hover:text-white transition-all duration-500">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-black text-[#0F172A] mb-4 tracking-tight">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed font-medium text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Process />
          <Testimonials />
          <Pricing />
          <FAQSection />
        </div>
      )}

      {currentView === AppView.DASHBOARD && isAuthenticated && <div className="pt-24"><Dashboard onNavigate={setCurrentView} /></div>}
      {currentView === AppView.CREATE_CAMPAIGN && <div className="pt-24"><CreateCampaign onBack={() => setCurrentView(isAuthenticated ? AppView.DASHBOARD : AppView.HOME)} isDemoMode={isDemoActive} demoStep={demoStep} setDemoStep={setDemoStep} /></div>}
      {currentView === AppView.CONTACT_US && <ContactUs onBack={() => setCurrentView(isAuthenticated ? AppView.DASHBOARD : AppView.HOME)} />}
      
      {currentView !== AppView.CONTACT_US && (
        <footer className="bg-[#0F172A] pt-32 pb-16">
          <div className="max-w-[1440px] mx-auto px-10">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-20 mb-32">
              <div className="max-w-md">
                <BrandLogo className="mb-8 scale-125 origin-left brightness-0 invert" />
                <p className="text-xl text-gray-500 font-medium leading-relaxed">The world's leading strategic reasoning engine for high-stakes financial marketing.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Platform</h4>
                  <ul className="space-y-4">
                    {['Solutions', 'Reasoning Hub', 'Compliance Audit', 'Security'].map(l => <li key={l}><a href="#" className="text-sm font-bold text-gray-500 hover:text-orange-primary transition-colors">{l}</a></li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Company</h4>
                  <ul className="space-y-4">
                    {['About Us', 'Case Studies', 'Press', 'Support'].map(l => <li key={l}><a href="#" className="text-sm font-bold text-gray-500 hover:text-orange-primary transition-colors">{l}</a></li>)}
                  </ul>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Join the Pulse</h4>
                  <div className="relative">
                    <input type="email" placeholder="Email address" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-orange-primary transition-all" />
                    <button className="absolute right-2 top-2 p-2 bg-orange-primary text-white rounded-xl hover:bg-white hover:text-orange-primary transition-all"><ArrowRight size={20} /></button>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-xs font-black text-gray-600 uppercase tracking-widest">© 2025 Newgen Digitalworks. All rights reserved.</p>
              <div className="flex gap-10">
                {['Privacy', 'Legal', 'Ethics'].map(l => <a key={l} href="#" className="text-xs font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors">{l}</a>)}
              </div>
            </div>
          </div>
        </footer>
      )}

      {isAccountModalOpen && <AccountModal onClose={() => setIsAccountModalOpen(false)} />}
      {isDemoActive && <DemoTour isDemoActive={isDemoActive} currentStep={demoStep} setDemoStep={setDemoStep} onClose={() => setIsDemoActive(false)} />}
    </div>
  );
};

export default App;

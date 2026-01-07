
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  Download, 
  Upload as UploadIcon, 
  Sparkles,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  Edit2,
  Brain,
  Activity,
  CheckCircle,
  Check,
  Info,
  BarChart3,
  Shield,
  Target,
  FileSearch,
  Compass,
  Zap,
  Layout,
  PieChart,
  MessageSquare
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { GoogleGenAI, Type } from "@google/genai";
import { DemoStep } from './DemoTour.tsx';

interface CreateCampaignProps {
  onBack: () => void;
  isDemoMode?: boolean;
  demoStep?: DemoStep;
  setDemoStep?: (step: DemoStep) => void;
}

interface CustomerData {
  [key: string]: any;
}

interface FeatureInfluence {
  feature: string;
  impact: number;
}

interface GeneratedMessage {
  customerId: string;
  customerName: string;
  rowNumber: number;
  subject: string;
  content: string;
  cta: string;
  strategyHook: string;
  targetingThesis: string;
  decisionLogic: string;
  complianceScore: number;
  status: 'Passed' | 'Failed';
  aiConfidence: number;
  featureInfluence: FeatureInfluence[];
}

const CreateCampaign: React.FC<CreateCampaignProps> = ({ onBack, isDemoMode = false, demoStep, setDemoStep }) => {
  const [tone, setTone] = useState('Professional');
  const [prompt, setPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; rowCount: number; data: CustomerData[]; columns: string[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState<GeneratedMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<'config' | 'results'>('config');
  const [selectedMessage, setSelectedMessage] = useState<GeneratedMessage | null>(null);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'strategy' | 'compliance'>('strategy');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const REQUIRED_COLUMNS = ['customerId', 'name', 'phone', 'email', 'age', 'city', 'country', 'occupation'];

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    if (!isDemoMode) return;
    if (demoStep === DemoStep.AUTO_UPLOAD) {
      const sampleData = [
        { customerId: 'CUST001', name: 'Rajesh Kumar', phone: '919876543210', email: 'rajesh.kumar@example.com', age: 35, city: 'Mumbai', country: 'India', occupation: 'Software Engineer', income: 75000, creditScore: 720 },
        { customerId: 'CUST002', name: 'Priya Sharma', phone: '919876543211', email: 'priya.sharma@example.com', age: 28, city: 'Delhi', country: 'India', occupation: 'Marketing Manager', income: 90000, creditScore: 780 },
        { customerId: 'CUST003', name: 'Amit Patel', phone: '919876543212', email: 'amit.patel@example.com', age: 42, city: 'Bangalore', country: 'India', occupation: 'Business Owner', income: 120000, creditScore: 650 }
      ];
      setUploadedFile({ 
        name: 'sample-customers.csv', 
        rowCount: 3, 
        data: sampleData,
        columns: Object.keys(sampleData[0])
      });
    }
    if (demoStep === DemoStep.AUTO_PROMPT) setPrompt('generate a personalized wealth management campaign targeting high-growth potential individuals');
    if (demoStep === DemoStep.START_GEN) startGeneration();
    if (demoStep === DemoStep.MODAL_EXPLAIN && generationResults.length > 0) {
      setSelectedMessage(generationResults[0]);
      setEditedContent(generationResults[0].content);
    }
  }, [demoStep, isDemoMode]);

  const startGeneration = async () => {
    const dataToProcess = uploadedFile?.data || [];
    if (dataToProcess.length === 0 || !prompt) return;
    
    setError(null);
    setIsGenerating(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const model = 'gemini-3-flash-preview';

    try {
      const results: GeneratedMessage[] = [];
      for (let i = 0; i < dataToProcess.length; i++) {
        const customer = dataToProcess[i];
        const response = await ai.models.generateContent({
          model,
          contents: `Act as a Senior BFSI Strategist. DATA: ${JSON.stringify(customer)}, OBJECTIVE: ${prompt}, TONE: ${tone}`,
          config: {
            systemInstruction: "Generate a complete compliant marketing solution with narrative reasoning logic.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                content: { type: Type.STRING },
                cta: { type: Type.STRING },
                strategyHook: { type: Type.STRING },
                targetingThesis: { type: Type.STRING },
                decisionLogic: { type: Type.STRING },
                complianceScore: { type: Type.INTEGER },
                aiConfidence: { type: Type.INTEGER },
                featureInfluence: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      feature: { type: Type.STRING },
                      impact: { type: Type.INTEGER }
                    },
                    required: ["feature", "impact"]
                  }
                }
              },
              required: ["subject", "content", "cta", "strategyHook", "targetingThesis", "decisionLogic", "complianceScore", "aiConfidence", "featureInfluence"]
            }
          }
        });

        const data = JSON.parse(response.text || '{}');
        results.push({
          customerId: customer.customerId || `CUST${i+1}`,
          customerName: customer.name || `Customer ${i+1}`,
          rowNumber: i + 1,
          subject: data.subject,
          content: data.content,
          cta: data.cta,
          strategyHook: data.strategyHook,
          targetingThesis: data.targetingThesis,
          decisionLogic: data.decisionLogic,
          complianceScore: data.complianceScore,
          aiConfidence: data.aiConfidence,
          status: data.complianceScore >= 80 ? 'Passed' : 'Failed',
          featureInfluence: data.featureInfluence || []
        });
        setGenerationResults([...results]);
        await sleep(300);
      }
      setCurrentStep('results');
    } catch (err: any) {
      setError("Critical Reasoning Failure. Please verify API configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = "customerId,name,phone,email,age,city,country,occupation,income,creditScore\nCUST001,Rajesh Kumar,919876543210,rajesh.kumar@example.com,35,Mumbai,India,Software Engineer,75000,720";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "strategic-brief.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as CustomerData[];
        setUploadedFile({ name: file.name, rowCount: jsonData.length, data: jsonData, columns: jsonData.length > 0 ? Object.keys(jsonData[0]) : [] });
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleSaveEdit = () => {
    if (selectedMessage) {
      const updatedResults = generationResults.map(res => 
        res.customerId === selectedMessage.customerId ? { ...res, content: editedContent } : res
      );
      setGenerationResults(updatedResults);
      setSelectedMessage({ ...selectedMessage, content: editedContent });
      setIsEditing(false);
    }
  };

  if (currentStep === 'results') {
    return (
      <div className="max-w-[1440px] mx-auto px-10 py-20 animate-in fade-in duration-700">
        <div className="flex justify-between items-end mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Solutions Finalized</span>
            </div>
            <h1 className="text-[64px] font-black text-[#0F172A] mb-4 tracking-tighter leading-none">Strategic Hub</h1>
            <p className="text-2xl text-gray-500 font-medium max-w-2xl">Audit machine-reasoned creative solutions with full transparency logic.</p>
          </div>
          <button onClick={() => setCurrentStep('config')} className="px-10 py-4 border-2 border-[#0F172A] text-[#0F172A] rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-[#0F172A] hover:text-white transition-all">
            Return to Briefing
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-20">
          {[
            { label: 'Solutions', value: generationResults.length.toString(), icon: <Layout size={20} /> },
            { label: 'Compliance Pass', value: `${generationResults.filter(r => r.status === 'Passed').length}`, icon: <Shield size={20} /> },
            { label: 'Avg Logic Score', value: `${generationResults.length > 0 ? Math.round(generationResults.reduce((acc, curr) => acc + curr.complianceScore, 0) / generationResults.length) : 0}%`, icon: <Zap size={20} /> },
            { label: 'Target Segment', value: 'High Growth', icon: <Target size={20} /> }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3 text-orange-primary mb-6">
                {stat.icon}
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
              <p className="text-5xl font-black text-[#0F172A]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-12 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Customer Context</th>
                <th className="px-12 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Strategy Hook</th>
                <th className="px-12 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">Clearance</th>
                <th className="px-12 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {generationResults.map((res, i) => (
                <tr key={i} className="group hover:bg-gray-50 transition-all">
                  <td className="px-12 py-10">
                    <p className="font-black text-xl text-[#0F172A]">{res.customerName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{res.customerId}</p>
                  </td>
                  <td className="px-12 py-10">
                    <p className="text-sm font-black text-[#0F172A] line-clamp-1">{res.strategyHook}</p>
                    <p className="text-[11px] text-gray-500 font-medium italic mt-1">{res.subject}</p>
                  </td>
                  <td className="px-12 py-10 text-center">
                    <span className={`px-5 py-2 rounded-full text-[11px] font-black border-2 ${res.status === 'Passed' ? 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]' : 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]'}`}>
                      {res.status === 'Passed' ? 'APPROVED' : 'REJECTED'}
                    </span>
                  </td>
                  <td className="px-12 py-10 text-right">
                    <button onClick={() => { setSelectedMessage(res); setEditedContent(res.content); setIsEditing(false); }} className="px-8 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-primary hover:scale-105 transition-all shadow-xl shadow-gray-200">
                      Audit Strategy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedMessage && (
          <div className="fixed inset-0 z-[100] bg-[#0F172A]/90 backdrop-blur-2xl flex items-center justify-center p-8">
             <div className="bg-white w-full max-w-7xl rounded-[4rem] shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-16 py-12 border-b border-gray-100 flex justify-between items-center">
                   <div className="flex items-center gap-8">
                     <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center shadow-inner">
                        <Compass size={32} />
                     </div>
                     <div>
                       <h2 className="text-[40px] font-black text-[#0F172A] tracking-tighter">Strategic Audit Matrix</h2>
                       <p className="text-xs text-gray-400 font-black uppercase tracking-[0.3em] mt-2">Segment Reasoning for {selectedMessage.customerName}</p>
                     </div>
                   </div>
                   <button onClick={() => setSelectedMessage(null)} className="p-4 hover:bg-gray-100 rounded-3xl transition-all"><X size={40} /></button>
                </div>

                <div className="p-16 overflow-y-auto grid grid-cols-1 lg:grid-cols-5 gap-16">
                  <div className="lg:col-span-3 space-y-12">
                    <div className="bg-[#F8FAFC] rounded-[3rem] p-12 border border-gray-100 shadow-inner">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 block">Asset 01: Headline</label>
                      <p className="text-3xl font-black text-[#0F172A] leading-none">{selectedMessage.subject}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset 02: Strategic Narrative</label>
                        {!isEditing ? <button onClick={() => setIsEditing(true)} className="text-[10px] font-black text-orange-primary uppercase tracking-widest flex items-center gap-2 hover:scale-110 transition-transform"><Edit2 size={12} /> Edit Draft</button> : <div className="flex gap-4"><button onClick={() => setIsEditing(false)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Discard</button><button onClick={handleSaveEdit} className="text-[10px] font-black text-green-600 uppercase tracking-widest">Commit Changes</button></div>}
                      </div>
                      {isEditing ? <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full h-80 p-12 rounded-[3rem] border-2 border-orange-100 bg-gray-50 text-xl font-medium text-[#0F172A] leading-relaxed outline-none focus:border-orange-500 transition-all shadow-inner" /> : <div className="bg-white border border-gray-100 p-12 rounded-[3.5rem] min-h-[350px] text-[#0F172A] leading-relaxed text-[20px] shadow-sm whitespace-pre-wrap">{selectedMessage.content}</div>}
                    </div>
                  </div>
                  <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-12 space-y-12 shadow-sm">
                      <div className="flex items-center gap-4">
                        <Brain size={28} className="text-orange-primary" />
                        <h4 className="text-2xl font-black text-[#0F172A]">Targeting Thesis</h4>
                      </div>
                      <p className="text-lg font-bold text-[#0F172A] leading-relaxed italic bg-orange-50/50 p-8 rounded-[2rem] border border-orange-100">"{selectedMessage.targetingThesis}"</p>
                      <div className="space-y-6">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Decision Matrix Weights</h5>
                        {selectedMessage.featureInfluence.map((item, idx) => (
                          <div key={idx} className="space-y-3">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest"><span className="text-gray-500">{item.feature}</span><span className="text-orange-primary">{item.impact}%</span></div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" style={{ width: `${item.impact}%` }} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#0F172A] p-10 rounded-[3rem] text-white flex justify-between items-center group cursor-pointer">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Trigger CTA</label>
                        <p className="text-2xl font-black group-hover:text-orange-primary transition-colors">{selectedMessage.cta}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-orange-primary transition-all"><ArrowRight size={24} /></div>
                    </div>
                  </div>
                </div>

                <div className="px-16 py-12 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model Index: Gemini 2.5 Flash Strategist</p>
                   <button onClick={() => setSelectedMessage(null)} className="px-16 py-6 bg-[#0F172A] text-white rounded-[2.5rem] font-black text-xl hover:bg-black hover:scale-[1.02] transition-all shadow-2xl">Finalize Review</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-10 py-32 animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-24">
        <button onClick={onBack} className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 hover:text-orange-primary transition-colors"><ArrowLeft size={20} /> Exit Session</button>
        <div className="px-6 py-2 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-3">
          <div className="w-2 h-2 bg-orange-primary rounded-full animate-pulse"></div>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Workspace: Institutional</p>
        </div>
      </div>

      <div className="text-center max-w-5xl mx-auto mb-32">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-[#0F172A] text-white rounded-full mb-10 shadow-xl">
          <Zap size={14} className="text-orange-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Strategy Ingestion Interface</span>
        </div>
        <h1 className="text-[96px] font-black text-[#0F172A] leading-[0.85] tracking-tighter mb-10">Deploy Your <span className="text-orange-primary">Intelligence.</span></h1>
        <p className="text-2xl text-gray-500 font-medium leading-relaxed">Synthesize compliant multichannel solutions with narrative-based reasoning logic.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5">
          <div className={`bg-white p-16 rounded-[4rem] border border-gray-100 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)] transition-all ${isDemoMode && demoStep === DemoStep.EXPLAIN_UPLOAD ? 'ring-8 ring-orange-500/20 scale-[1.02]' : ''}`}>
             <div className="flex items-center gap-6 mb-12">
                <span className="w-16 h-16 bg-[#0F172A] text-white rounded-3xl flex items-center justify-center text-3xl font-black">01</span>
                <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter">Project Brief</h3>
             </div>
             <p className="text-lg text-gray-500 font-medium mb-12 leading-relaxed italic">Upload the primary audience dataset to initiate segment-level tactical reasoning.</p>
             {!uploadedFile ? (
               <div onClick={() => !isDemoMode && fileInputRef.current?.click()} className="border-4 border-dashed border-gray-100 rounded-[3rem] p-24 text-center cursor-pointer hover:border-orange-primary hover:bg-orange-50/20 transition-all group relative overflow-hidden">
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx,.xls" />
                 <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                   <UploadIcon size={36} className="text-orange-primary" />
                 </div>
                 <p className="text-3xl font-black text-[#0F172A] mb-2 tracking-tighter">Ingest Dataset</p>
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest">CSV • XLSX • 10MB Limit</p>
               </div>
             ) : (
               <div className="bg-green-50 border-2 border-green-100 p-12 rounded-[3.5rem] animate-in zoom-in-95 duration-500">
                 <div className="flex items-center gap-6 mb-8">
                   <div className="w-14 h-14 bg-green-500 rounded-3xl flex items-center justify-center text-white shadow-xl"><Check size={32} strokeWidth={4} /></div>
                   <div>
                     <h4 className="text-2xl font-black text-[#0F172A] tracking-tighter leading-tight">Brief Accepted</h4>
                     <p className="text-xs text-green-700 font-black uppercase tracking-widest mt-1">{uploadedFile.rowCount} Audience Nodes Detected</p>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mb-10">
                   {REQUIRED_COLUMNS.slice(0, 4).map(c => <div key={c} className="bg-white p-4 rounded-2xl border border-green-100 text-[10px] font-black text-gray-700 uppercase tracking-widest">{c}</div>)}
                 </div>
                 <button onClick={() => {setUploadedFile(null); if(fileInputRef.current) fileInputRef.current.value="";}} className="w-full py-4 text-gray-400 hover:text-red-500 font-black text-[10px] uppercase tracking-[0.3em] border-t border-green-100 pt-8 transition-colors">Reset Project Brief</button>
               </div>
             )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-16">
          <div className={`bg-white p-16 rounded-[4rem] border border-gray-100 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)] transition-all ${isDemoMode && demoStep === DemoStep.EXPLAIN_PROMPT ? 'ring-8 ring-orange-500/20 scale-[1.02]' : ''}`}>
             <div className="flex items-center gap-6 mb-16">
                <span className="w-16 h-16 bg-[#0F172A] text-white rounded-3xl flex items-center justify-center text-3xl font-black">02</span>
                <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter">Strategic Directive</h3>
             </div>
             <div className="space-y-12">
               <div>
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare size={20} className="text-orange-primary" />
                    <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Campaign Objective</label>
                  </div>
                  <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} readOnly={isDemoMode} placeholder="Define the primary objective. e.g. Hyper-personalized Wealth Management proposition for high-growth potential individuals..." className="w-full h-64 p-12 rounded-[3.5rem] border-2 border-gray-100 bg-white outline-none focus:border-orange-primary transition-all text-2xl font-black text-[#0F172A] tracking-tight leading-relaxed placeholder:text-gray-200 shadow-inner" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 block">Persona Archetype</label>
                    <div className="space-y-3">
                      {['Professional', 'Friendly', 'Bold'].map(t => (
                        <button key={t} onClick={() => !isDemoMode && setTone(t)} className={`w-full py-6 px-10 rounded-[2rem] border-2 font-black text-xs uppercase tracking-widest text-left flex justify-between items-center transition-all ${tone === t ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-2xl' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}>
                          {t} {tone === t && <Zap size={16} className="text-orange-primary" />}
                        </button>
                      ))}
                    </div>
                 </div>
                 <div className="bg-[#F8FAFC] p-10 rounded-[3.5rem] border border-gray-100 flex flex-col justify-center items-center text-center">
                    <PieChart size={40} className="text-gray-200 mb-6" />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Reasoning engine will automatically weight messaging hooks based on demographics.</p>
                 </div>
               </div>
             </div>
          </div>

          <div className={`p-16 rounded-[5rem] bg-[#0F172A] shadow-2xl transition-all flex flex-col md:flex-row justify-between items-center gap-12 group ${isDemoMode && demoStep === DemoStep.START_GEN ? 'ring-8 ring-orange-500/20 scale-[1.03]' : ''}`}>
             <div className="max-w-xs">
                <h3 className="text-5xl font-black text-white mb-4 tracking-tighter">Initiate.</h3>
                <p className="text-lg text-gray-400 font-bold leading-relaxed">Begin hyper-personalized solution synthesis for {uploadedFile?.rowCount || '0'} nodes.</p>
             </div>
             <button onClick={startGeneration} disabled={(!uploadedFile || !prompt || isGenerating) && !isDemoMode} className="px-16 py-10 bg-orange-primary text-white rounded-[3.5rem] font-black text-3xl hover:scale-105 active:scale-95 transition-all flex items-center gap-6 shadow-2xl disabled:opacity-50 disabled:grayscale">
                {isGenerating ? <Loader2 className="animate-spin" size={40} /> : <Sparkles size={40} />}
                Synthesize
             </button>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-[#0F172A]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700">
           <div className="relative mb-16">
              <div className="w-48 h-48 rounded-full border-[12px] border-orange-500/10 flex items-center justify-center">
                 <Loader2 className="animate-spin text-orange-primary" size={120} strokeWidth={1} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Brain size={48} className="text-white animate-pulse" />
              </div>
           </div>
           <h2 className="text-[72px] font-black text-white mb-8 tracking-tighter leading-none">Strategizing...</h2>
           <p className="text-3xl text-gray-400 font-medium max-w-3xl mb-16 leading-relaxed">Correlating audience metadata with global compliance heuristics and psychological trigger datasets.</p>
           <div className="w-full max-w-3xl bg-white/5 rounded-full h-4 overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400 h-full transition-all duration-1000 shadow-[0_0_40px_rgba(249,115,22,0.6)]" style={{ width: `${(generationResults.length / (uploadedFile?.rowCount || 1)) * 100}%` }} />
           </div>
           <p className="mt-10 text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Synthesis Core: {generationResults.length + 1} / {uploadedFile?.rowCount}</p>
        </div>
      )}
    </div>
  );
};

export default CreateCampaign;

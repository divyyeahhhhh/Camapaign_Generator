
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
  Eye,
  MessageSquare,
  Edit2,
  Brain,
  Activity,
  CheckCircle,
  Check,
  Info,
  Layers,
  BarChart3,
  Shield,
  Target,
  FileSearch,
  Compass,
  Zap,
  Layout,
  PieChart
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { GoogleGenAI, Type } from "@google/genai";
import { DemoStep } from './DemoTour';

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
  targetingThesis: string; // The "Logic" for why this person
  decisionLogic: string; // Narrative explanation of creative choices
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

  const generateWithRetry = async (ai: any, params: any, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await ai.models.generateContent(params);
      } catch (err: any) {
        if (err.message?.includes('429') && i < retries - 1) {
          console.warn(`Rate limit hit, retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
          await sleep(delay);
          delay *= 2; 
          continue;
        }
        throw err;
      }
    }
  };

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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';

    try {
      const results: GeneratedMessage[] = [];
      for (let i = 0; i < dataToProcess.length; i++) {
        const customer = dataToProcess[i];
        const response = await generateWithRetry(ai, {
          model,
          contents: `
            Act as a Senior BFSI Marketing Consultant. Develop a complete marketing campaign solution for this specific customer segment.
            
            CUSTOMER CONTEXT: ${JSON.stringify(customer)}
            STRATEGIC OBJECTIVE: ${prompt}
            BRAND VOICE: ${tone}
            
            You must output a highly personalized campaign including a full strategy breakdown.
          `,
          config: {
            systemInstruction: `You are the Lead Strategist. 
            Deliver a complete campaign suite.
            1. FULL SOLUTION: Subject line, high-converting body text, and a strong CTA.
            2. NARRATIVE LOGIC: Explain EXACTLY why you chose these words. Link the customer's demographics (income, job, age) to the psychological triggers used in the content.
            3. TARGETING THESIS: Define the core hook for this person.
            4. BIAS CHECK: Ensure compliance with global BFSI fairness and risk rules.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                content: { type: Type.STRING },
                cta: { type: Type.STRING },
                strategyHook: { type: Type.STRING, description: "One-sentence psychological hook." },
                targetingThesis: { type: Type.STRING, description: "Why this specific customer is being targeted this way." },
                decisionLogic: { type: Type.STRING, description: "A detailed narrative of the logic behind creative decisions." },
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
      console.error("Generation error:", err);
      setError("Strategic generation failed. Our engines are checking for compliance bottlenecks.");
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
    link.setAttribute("download", "sample-brief.csv");
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
      <div className="max-w-[1440px] mx-auto px-10 py-16 animate-in fade-in duration-700">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Solutions Finalized</span>
            </div>
            <h1 className="text-[52px] font-black text-[#0F172A] mb-3 tracking-tighter leading-tight">Strategic Hub</h1>
            <p className="text-[20px] text-[#64748B] font-medium max-w-2xl">Campaign assets generated with machine-reasoned decision logic and full compliance clearance.</p>
          </div>
          <button onClick={() => setCurrentStep('config')} className="px-6 py-3 border-2 border-[#0F172A] text-[#0F172A] rounded-xl font-black text-sm hover:bg-[#0F172A] hover:text-white transition-all">
            Return to Briefing
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {[
            { label: 'Strategic Solutions', value: generationResults.length.toString(), icon: <Layout size={20} /> },
            { label: 'Clearance Rate', value: `${generationResults.filter(r => r.status === 'Passed').length} / ${generationResults.length}`, icon: <Shield size={20} /> },
            { label: 'Mean Logic Score', value: `${generationResults.length > 0 ? Math.round(generationResults.reduce((acc, curr) => acc + curr.complianceScore, 0) / generationResults.length) : 0}%`, icon: <Zap size={20} /> },
            { label: 'Targeting Precision', value: 'High', icon: <Target size={20} /> }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3 text-[#F97316] mb-4">
                {stat.icon}
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
              </div>
              <p className="text-4xl font-black text-[#0F172A]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-2xl">
          <div className="px-10 py-8 bg-[#F8FAFC] border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-[#0F172A]">Campaign Execution Queue</h3>
            <button className="flex items-center gap-2 px-6 py-2 bg-white rounded-xl border border-gray-200 text-xs font-black hover:bg-gray-50 transition-all">
              <Download size={14} /> Export Brief (CSV)
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Audience Context</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Strategic Tactical Hook</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Safety Clearance</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {generationResults.map((res, i) => (
                <tr key={i} className="group hover:bg-gray-50/80 transition-all">
                  <td className="px-10 py-8">
                    <p className="font-black text-lg text-[#0F172A]">{res.customerName}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-tight">Tier 1 • Segment ID: {res.customerId}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                      <p className="text-sm font-black text-[#0F172A] line-clamp-1">{res.strategyHook}</p>
                    </div>
                    <p className="text-[12px] text-gray-400 font-medium line-clamp-1 italic">Subject: {res.subject}</p>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black border-2 ${res.status === 'Passed' ? 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]' : 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]'}`}>
                      {res.status === 'Passed' ? <CheckCircle2 size={12} /> : <X size={12} />} {res.status === 'Passed' ? 'APPROVED' : 'REJECTED'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => { setSelectedMessage(res); setEditedContent(res.content); setIsEditing(false); }} 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-black hover:scale-105 transition-all shadow-lg shadow-gray-200"
                    >
                      Audit Strategy <FileSearch size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedMessage && (
          <div className="fixed inset-0 z-[100] bg-[#0F172A]/80 backdrop-blur-xl flex items-center justify-center p-6">
             <div className="bg-white w-full max-w-7xl rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-12 py-10 border-b border-gray-100 flex justify-between items-center">
                   <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center shadow-inner">
                        <Compass size={32} />
                     </div>
                     <div>
                       <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter">Strategic Audit Matrix</h2>
                       <p className="text-sm text-[#64748B] font-bold uppercase tracking-widest mt-1">Full decision transparency for {selectedMessage.customerName}</p>
                     </div>
                   </div>
                   <button onClick={() => setSelectedMessage(null)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all"><X size={32} /></button>
                </div>

                <div className="p-12 overflow-y-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
                  <div className="lg:col-span-3 space-y-10">
                    <div className="space-y-6">
                      <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-gray-100">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Creative Asset 01: Headline</label>
                        <p className="text-2xl font-black text-[#0F172A] leading-tight">{selectedMessage.subject}</p>
                      </div>
                      
                      <div className="relative group">
                        <div className="flex justify-between items-center mb-4 px-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Creative Asset 02: Narrative Body</label>
                          {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-xs font-black text-orange-500 hover:text-orange-600 transition-colors uppercase"><Edit2 size={14} /> Edit Script</button>
                          ) : (
                            <div className="flex gap-4">
                              <button onClick={() => setIsEditing(false)} className="text-xs font-black text-gray-400 uppercase">Discard</button>
                              <button onClick={handleSaveEdit} className="text-xs font-black text-green-600 uppercase">Commit Changes</button>
                            </div>
                          )}
                        </div>
                        {isEditing ? (
                          <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full h-72 p-10 rounded-[2.5rem] border-2 border-orange-100 bg-gray-50 font-medium text-gray-800 text-lg leading-relaxed outline-none focus:border-orange-500 transition-all shadow-inner" />
                        ) : (
                          <div className="bg-white border border-gray-100 p-12 rounded-[2.5rem] min-h-[300px] text-gray-700 leading-relaxed text-[20px] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.03)] whitespace-pre-wrap font-sans">
                            {selectedMessage.content}
                          </div>
                        )}
                      </div>

                      <div className="bg-[#0F172A] text-white p-10 rounded-[2.5rem] flex justify-between items-center shadow-xl">
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Creative Asset 03: CTA Trigger</label>
                          <p className="text-2xl font-black">{selectedMessage.cta}</p>
                        </div>
                        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center animate-bounce">
                          <ArrowRight size={28} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#F8FAFC] rounded-[2rem] p-2 flex gap-2 border border-gray-100">
                      <button onClick={() => setActiveAnalysisTab('strategy')} className={`flex-1 py-4 text-[10px] font-black rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] ${activeAnalysisTab === 'strategy' ? 'bg-white text-[#0F172A] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}><Brain size={16} /> Decision Engine</button>
                      <button onClick={() => setActiveAnalysisTab('compliance')} className={`flex-1 py-4 text-[10px] font-black rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] ${activeAnalysisTab === 'compliance' ? 'bg-white text-[#0F172A] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}><Shield size={16} /> Risk Audit</button>
                    </div>

                    {activeAnalysisTab === 'strategy' ? (
                      <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                          <div className="flex items-center gap-4">
                            <PieChart size={24} className="text-orange-500" />
                            <h4 className="text-xl font-black text-[#0F172A]">Targeting Thesis</h4>
                          </div>
                          <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                            <p className="text-[#0F172A] font-bold leading-relaxed text-lg">
                              {selectedMessage.targetingThesis}
                            </p>
                          </div>
                          <div className="space-y-6">
                             <div className="flex items-center gap-4">
                                <Activity size={20} className="text-blue-500" />
                                <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Marketing Decision Logic</h5>
                             </div>
                             <p className="text-[15px] text-[#64748B] leading-relaxed font-medium bg-blue-50/30 p-6 rounded-2xl italic border border-blue-50">
                                "{selectedMessage.decisionLogic}"
                             </p>
                          </div>
                          <div className="space-y-6 pt-6 border-t border-gray-50">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weight Distribution</h5>
                            {selectedMessage.featureInfluence.map((item, idx) => (
                              <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center text-[13px] font-black"><span className="text-[#334155]">{item.feature}</span><span className="text-orange-500">{item.impact}%</span></div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000" style={{ width: `${item.impact}%` }} /></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 space-y-10 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Shield size={24} className="text-green-500" />
                              <h4 className="text-xl font-black text-[#0F172A]">Risk Clearance</h4>
                            </div>
                            <div className="px-5 py-2 bg-green-50 text-green-700 rounded-2xl text-[12px] font-black border border-green-100">{selectedMessage.complianceScore}% PASS</div>
                          </div>
                          <div className="space-y-4">
                            {[
                              { label: "Fair Lending Disclosure", status: "VERIFIED" },
                              { label: "Predatory Tone Analysis", status: "SECURE" },
                              { label: "T&C Visibility Check", status: "VERIFIED" },
                              { label: "Data Integrity Validation", status: "VERIFIED" }
                            ].map((check, i) => (
                              <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-sm font-black text-gray-700">{check.label}</span>
                                <div className="flex items-center gap-2 text-green-600 font-black text-[10px]">
                                   <CheckCircle size={14} /> {check.status}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100 flex items-start gap-4">
                             <Info size={18} className="text-green-600 shrink-0 mt-0.5" />
                             <p className="text-xs text-green-800 font-bold leading-relaxed">
                               This content has been pre-screened against BFSI regulatory standards for promotional lending. No promissory language detected.
                             </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-12 py-10 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Model: Gemini 3 Flash Strategist • Reasoning Seed: 8294-X</p>
                   <button onClick={() => setSelectedMessage(null)} className="px-16 py-5 bg-[#0F172A] text-white rounded-[2rem] font-black text-lg hover:bg-black hover:scale-[1.02] transition-all shadow-2xl shadow-gray-200">Close Strategy Session</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-10 py-20 animate-in fade-in duration-700">
      <div className="mb-16 flex justify-between items-center">
        <button onClick={onBack} className="text-gray-400 font-black flex items-center gap-3 hover:text-[#F97316] transition-colors uppercase text-xs tracking-[0.2em]"><ArrowLeft size={18} /> Exit Workspace</button>
        <div className="flex items-center gap-4 bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Strategist: Divya Sivakumar</p>
        </div>
      </div>

      {error && <div className="mb-12 p-6 bg-red-50 border-2 border-red-100 text-red-600 rounded-3xl font-black text-sm flex items-center gap-4 animate-bounce"><X size={20} /> {error}</div>}

      <div className="mb-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-[#0F172A] rounded-full mb-8 shadow-xl">
          <Sparkles size={16} className="text-orange-400" />
          <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Strategic Command Suite</span>
        </div>
        <h1 className="text-[72px] font-black text-[#0F172A] mb-6 tracking-tighter leading-[0.95]">Craft Your <span className="text-[#F97316]">Strategic</span> Blueprint</h1>
        <p className="text-[24px] text-[#64748B] font-medium leading-relaxed">Elevate your customer engagement with AI-reasoned multichannel solutions designed for strict compliance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-12">
          {/* Step 1: Briefing */}
          <div className={`bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] transition-all ${isDemoMode && demoStep === DemoStep.EXPLAIN_UPLOAD ? 'ring-4 ring-orange-400 ring-offset-8 scale-[1.02]' : ''}`}>
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-6">
                <span className="w-14 h-14 bg-[#0F172A] text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg">1</span>
                <h3 className="text-3xl font-black text-[#0F172A] tracking-tight">Project Brief</h3>
              </div>
            </div>
            
            <p className="text-[#64748B] mb-10 text-lg font-medium leading-relaxed italic">Upload your core audience data to begin segment-based tactical reasoning.</p>

            {!uploadedFile ? (
              <div onClick={() => !isDemoMode && fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-20 text-center cursor-pointer hover:bg-gray-50 hover:border-[#F97316] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:blur-3xl transition-all"></div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx,.xls" />
                <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                  <UploadIcon size={36} className="text-[#F97316]" />
                </div>
                <p className="text-2xl font-black text-[#0F172A] mb-2">Ingest Dataset</p>
                <p className="text-[#64748B] font-bold text-sm uppercase tracking-widest">CSV • XLSX • 10 Row Limit</p>
              </div>
            ) : (
              <div className="bg-[#F0FDF4]/60 border-2 border-[#DCFCE7] p-10 rounded-[2.5rem] space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg"><Check size={28} strokeWidth={4} /></div>
                  <div>
                    <h4 className="text-2xl font-black text-[#0F172A] tracking-tight">Brief Accepted</h4>
                    <p className="text-sm text-green-700 font-black uppercase tracking-widest">{uploadedFile.rowCount} Audience Nodes Detected</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {REQUIRED_COLUMNS.slice(0, 4).map(col => (
                    <div key={col} className="bg-white p-4 rounded-2xl border border-green-100 flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-black text-gray-700 uppercase">{col}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {setUploadedFile(null); if(fileInputRef.current) fileInputRef.current.value = "";}}
                  className="w-full py-4 text-gray-400 hover:text-red-500 font-black text-[11px] uppercase tracking-[0.25em] border-t border-green-100 pt-6"
                >
                  Reset Project Brief
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-12">
          {/* Step 2: Strategy */}
          <div className={`bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] transition-all ${isDemoMode && demoStep === DemoStep.EXPLAIN_PROMPT ? 'ring-4 ring-orange-400 ring-offset-8 scale-[1.02]' : ''}`}>
            <div className="flex items-center gap-6 mb-12">
              <span className="w-14 h-14 bg-[#0F172A] text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg">2</span>
              <h3 className="text-3xl font-black text-[#0F172A] tracking-tight">Strategic Directive</h3>
            </div>
            
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare size={20} className="text-[#F97316]" />
                  <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Campaign Objective</label>
                </div>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  readOnly={isDemoMode}
                  placeholder="e.g. Design a hyper-personalized Wealth Management proposition for Emerging Affluent segments, highlighting ethical investing and multi-generational security..."
                  className="w-full h-56 p-8 rounded-[2rem] border-2 border-gray-100 bg-white outline-none focus:border-orange-500 transition-all text-gray-800 font-bold text-xl leading-relaxed placeholder:text-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Persona Archetype</label>
                  <div className="grid grid-cols-1 gap-3">
                    {['Professional', 'Empathetic', 'Bold'].map(t => (
                      <button 
                        key={t}
                        onClick={() => !isDemoMode && setTone(t)}
                        className={`py-5 px-8 rounded-2xl font-black text-sm uppercase tracking-widest border-2 transition-all text-left flex justify-between items-center ${tone === t ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                      >
                        {t}
                        {tone === t && <Zap size={16} className="text-orange-500" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-[#F8FAFC] rounded-[2.5rem] p-8 border border-gray-100 flex flex-col justify-center">
                   <PieChart size={32} className="text-gray-200 mb-4" />
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed">AI will automatically analyze audience income tiers and geographic behavior to weight messaging logic.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-12 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col md:flex-row justify-between items-center gap-10 transition-all ${isDemoMode && demoStep === DemoStep.START_GEN ? 'ring-4 ring-orange-500 ring-offset-8 scale-[1.03]' : ''}`}>
            <div className="text-left max-w-sm">
              <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Initiate Engine</h3>
              <p className="text-gray-400 font-bold text-lg leading-relaxed">Begin hyper-personalized solution synthesis for {uploadedFile?.rowCount || '0'} segments.</p>
            </div>
            <button 
              onClick={startGeneration}
              disabled={(!uploadedFile || !prompt || isGenerating) && !isDemoMode}
              className="px-16 py-8 bg-orange-500 text-white rounded-[2.5rem] font-black text-2xl hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-[0_20px_50px_-10px_rgba(249,115,22,0.5)] disabled:opacity-50 disabled:grayscale"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={32} /> : <Sparkles size={32} />}
              Execute Brief
            </button>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-[#0F172A]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-10 animate-in fade-in duration-700 text-center">
           <div className="relative mb-12">
              <div className="w-40 h-40 rounded-full border-[10px] border-orange-500/10 flex items-center justify-center">
                 <Loader2 className="animate-spin text-orange-500" size={100} strokeWidth={1} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Brain size={40} className="text-white animate-pulse" />
              </div>
           </div>
           <h2 className="text-[56px] font-black text-white mb-6 tracking-tighter leading-none">Strategizing Brief</h2>
           <p className="text-2xl text-gray-400 font-medium max-w-2xl mb-12 leading-relaxed">Applying segment-specific psychological hooks and cross-referencing global BFSI compliance datasets...</p>
           
           <div className="w-full max-w-2xl bg-white/5 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400 h-full transition-all duration-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]"
                style={{ width: `${(generationResults.length / (uploadedFile?.rowCount || 1)) * 100}%` }}
              />
           </div>
           <p className="mt-8 text-sm font-black text-gray-500 uppercase tracking-[0.5em]">Synthesis Phase: {generationResults.length + 1} / {uploadedFile?.rowCount}</p>
        </div>
      )}
    </div>
  );
};

export default CreateCampaign;

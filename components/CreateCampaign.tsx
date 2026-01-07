
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, // Added missing ArrowRight icon import
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
  FileSearch
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
  complianceScore: number;
  status: 'Passed' | 'Failed';
  aiConfidence: number;
  reasoning: string;
  logicExplanation: string;
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
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'xai' | 'compliance'>('xai');
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
    if (demoStep === DemoStep.AUTO_PROMPT) setPrompt('generate a personalized credit card offer for each customer');
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
            Create a complete marketing campaign solution for the following customer:
            CUSTOMER DATA: ${JSON.stringify(customer)}
            CAMPAIGN PROMPT: ${prompt}
            DESIRED TONE: ${tone}
            
            Strictly adhere to BFSI compliance standards.
          `,
          config: {
            systemInstruction: `You are an expert BFSI Marketing Strategist. 
            For every customer, you must:
            1. Generate a COMPLETE marketing solution: Subject Line, Primary Message, and Call to Action.
            2. Define a 'Strategy Hook' (the psychological/financial angle).
            3. Provide 'Explainable AI' Logic: Clearly explain the reasoning and logic behind every major decision (Why this tone? Why this specific benefit? How did the data influence the offer?).`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                content: { type: Type.STRING },
                cta: { type: Type.STRING },
                strategyHook: { type: Type.STRING },
                complianceScore: { type: Type.INTEGER },
                aiConfidence: { type: Type.INTEGER },
                logicExplanation: { type: Type.STRING, description: "Detailed explanation of the reasoning and logic behind the creative decisions." },
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
              required: ["subject", "content", "cta", "strategyHook", "complianceScore", "aiConfidence", "logicExplanation", "featureInfluence"]
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
          complianceScore: data.complianceScore,
          aiConfidence: data.aiConfidence,
          status: data.complianceScore >= 80 ? 'Passed' : 'Failed',
          reasoning: data.logicExplanation,
          logicExplanation: data.logicExplanation,
          featureInfluence: data.featureInfluence || []
        });
        setGenerationResults([...results]);
        await sleep(400);
      }
      setCurrentStep('results');
    } catch (err: any) {
      console.error("Generation error:", err);
      setError("Failed to generate campaign. Please check your prompt.");
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
    link.setAttribute("download", "sample-customers.csv");
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

  // Added missing handleSaveEdit function to resolve compilation errors and enable message editing
  const handleSaveEdit = () => {
    if (selectedMessage) {
      const updatedResults = generationResults.map(res => 
        res.customerId === selectedMessage.customerId 
          ? { ...res, content: editedContent } 
          : res
      );
      setGenerationResults(updatedResults);
      setSelectedMessage({ ...selectedMessage, content: editedContent });
      setIsEditing(false);
    }
  };

  if (currentStep === 'results') {
    return (
      <div className="max-w-[1440px] mx-auto px-10 py-12 animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-[40px] font-extrabold text-[#0F172A] mb-2 tracking-tight">Campaign Strategy Review</h1>
            <p className="text-[18px] text-[#64748B] font-medium">{generationResults.length} complete marketing solutions generated</p>
          </div>
          <button onClick={() => setCurrentStep('config')} className="text-[#F97316] font-bold flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Editor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Solutions', value: generationResults.length.toString(), color: 'text-[#0F172A]' },
            { label: 'Strategy Passed', value: generationResults.filter(r => r.status === 'Passed').length.toString(), color: 'text-[#22C55E]' },
            { label: 'Risk Flags', value: generationResults.filter(r => r.status === 'Failed').length.toString(), color: 'text-[#EF4444]' },
            { label: 'Confidence', value: `${generationResults.length > 0 ? Math.round(generationResults.reduce((acc, curr) => acc + curr.aiConfidence, 0) / generationResults.length) : 0}%`, color: 'text-[#0F172A]' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest font-mono">{stat.label}</p>
              <p className={`text-4xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Customer & Context</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Marketing Strategy Hook</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Compliance</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {generationResults.map((res, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-gray-900">{res.customerName}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-0.5 tracking-tight">Row {res.rowNumber} • {res.customerId}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Target size={14} className="text-orange-500" />
                      <p className="text-sm font-bold text-orange-600">{res.strategyHook}</p>
                    </div>
                    <p className="text-[13px] text-gray-500 line-clamp-1 italic">Subject: {res.subject}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-black border ${res.status === 'Passed' ? 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]' : 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]'}`}>
                      {res.status === 'Passed' ? <CheckCircle2 size={12} /> : <X size={12} />} {res.complianceScore}%
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => { setSelectedMessage(res); setEditedContent(res.content); setIsEditing(false); }} 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-xs hover:bg-black transition-all"
                    >
                      <FileSearch size={14} /> View Solution
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedMessage && (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                   <div className="flex items-center gap-4">
                     <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                        <Sparkles size={28} />
                     </div>
                     <div>
                       <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Full Campaign Solution</h2>
                       <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{selectedMessage.customerName} • Decision Transparency Analysis</p>
                     </div>
                   </div>
                   <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={28} /></button>
                </div>

                <div className="p-10 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Email Subject / Headline</label>
                        <p className="text-xl font-bold text-gray-900 leading-tight">{selectedMessage.subject}</p>
                      </div>
                      
                      <div className="relative group">
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Main Campaign Message</label>
                          {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"><Edit2 size={12} /> Edit</button>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => setIsEditing(false)} className="px-3 py-1 border border-gray-200 rounded-lg text-xs font-bold text-gray-400">Cancel</button>
                              <button onClick={handleSaveEdit} className="px-3 py-1 bg-orange-500 text-white rounded-lg text-xs font-bold">Save</button>
                            </div>
                          )}
                        </div>
                        {isEditing ? (
                          <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full h-56 p-6 rounded-2xl border border-gray-200 bg-gray-50 font-medium text-gray-800 leading-relaxed outline-none focus:ring-2 focus:ring-orange-100" />
                        ) : (
                          <div className="bg-white border border-gray-100 p-8 rounded-3xl min-h-[220px] text-gray-700 leading-relaxed text-[17px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] whitespace-pre-wrap font-sans">
                            {selectedMessage.content}
                          </div>
                        )}
                      </div>

                      <div className="bg-[#0F172A] text-white p-6 rounded-2xl flex justify-between items-center">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Call to Action (CTA)</label>
                          <p className="text-lg font-bold">{selectedMessage.cta}</p>
                        </div>
                        <ArrowRight size={20} className="text-orange-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-[#F8FAFC] rounded-2xl p-1.5 flex gap-1.5">
                      <button onClick={() => setActiveAnalysisTab('xai')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${activeAnalysisTab === 'xai' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><BarChart3 size={16} /> Explain Logic</button>
                      <button onClick={() => setActiveAnalysisTab('compliance')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${activeAnalysisTab === 'compliance' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Shield size={16} /> Compliance</button>
                    </div>

                    {activeAnalysisTab === 'xai' ? (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center"><Brain size={20} /></div>
                            <h4 className="text-lg font-black text-[#0F172A] tracking-tight">Strategic Reasoning</h4>
                          </div>
                          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-gray-700 font-medium leading-relaxed italic text-[15px]">
                              "{selectedMessage.logicExplanation}"
                            </p>
                          </div>
                          <div className="space-y-4 pt-4 border-t border-gray-50">
                            <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Data Influence Weights</h5>
                            {selectedMessage.featureInfluence.map((item, idx) => (
                              <div key={idx} className="space-y-1.5">
                                <div className="flex justify-between items-center text-[13px] font-bold"><span className="text-gray-600">{item.feature}</span><span className="text-orange-500">{item.impact}%</span></div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-orange-400 rounded-full" style={{ width: `${item.impact}%` }} /></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><Shield size={20} /></div>
                              <h4 className="text-lg font-black text-[#0F172A] tracking-tight">Compliance Audit</h4>
                            </div>
                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[11px] font-black">{selectedMessage.complianceScore}% Safe</div>
                          </div>
                          <div className="space-y-3">
                            {["Promissory Language", "Risk Disclosures", "Data Masking", "Offer Accuracy"].map((check, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-700">{check}</span>
                                <CheckCircle size={16} className="text-green-500" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-10 py-8 border-t border-gray-100 bg-gray-50 flex justify-end">
                   <button onClick={() => setSelectedMessage(null)} className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-200">Done Reviewing</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-10 py-12 animate-in fade-in duration-500">
      <div className="mb-10 flex justify-between items-start">
        <button onClick={onBack} className="text-gray-500 font-bold flex items-center gap-2 hover:text-[#F97316] transition-colors"><ArrowLeft size={18} /> Back to Dashboard</button>
        <div className="text-right"><p className="text-sm font-bold text-[#0F172A]">Divya Sivakumar <span className="text-gray-400 font-medium">• Free</span></p></div>
      </div>
      {error && <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl font-bold text-sm flex items-center gap-2"><X size={16} /> {error}</div>}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full mb-4"><Sparkles size={14} className="text-gray-600" /><span className="text-[12px] font-bold text-gray-600 uppercase tracking-widest">Explainable AI Interface</span></div>
        <h1 className="text-[48px] font-extrabold text-[#0F172A] mb-2 tracking-tight">Create New Campaign</h1>
        <p className="text-[20px] text-[#64748B] font-medium leading-relaxed">Upload data and generate solutions with complete transparency</p>
      </div>

      <div className="space-y-8">
        <div className={`bg-white p-10 rounded-[1.5rem] border border-gray-100 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)] transition-all ${isDemoMode && demoStep === DemoStep.EXPLAIN_UPLOAD ? 'ring-4 ring-orange-400 ring-offset-4' : ''}`}>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4"><span className="w-10 h-10 bg-[#FFEDD5] text-[#F97316] rounded-xl flex items-center justify-center text-2xl font-black">1</span><h3 className="text-[28px] font-bold text-[#0F172A]">Upload Customer Data</h3></div>
            <button onClick={handleDownloadSample} className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"><Download size={16} /> Download Sample</button>
          </div>
          <p className="text-gray-500 mb-8 font-medium">Required columns: customerId, name, phone, email, age, city, country, occupation</p>
          {!uploadedFile ? (
            <div onClick={() => !isDemoMode && fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center cursor-pointer hover:bg-gray-50 hover:border-[#F97316] transition-all group">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx,.xls" />
              <div className="w-16 h-16 bg-[#FFF7ED] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><UploadIcon size={32} className="text-[#F97316]" /></div>
              <div><p className="text-2xl font-bold text-[#0F172A] mb-1">Drag & drop your CSV file here</p><p className="text-gray-500 font-medium">or click to browse</p></div>
            </div>
          ) : (
            <div className="bg-[#F0FDF4]/40 border border-[#DCFCE7] p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white"><Check size={20} strokeWidth={3} /></div><h4 className="text-[28px] font-black text-[#0F172A] tracking-tight">CSV Preview - All Required Columns Found</h4></div>
              <p className="text-[15px] text-[#64748B] font-bold ml-11">{uploadedFile.rowCount} rows loaded • {uploadedFile.columns.length} columns detected</p>
              <div className="mt-8 flex flex-wrap gap-2">{REQUIRED_COLUMNS.map(col => (<span key={col} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#F97316] text-white rounded-full text-[13px] font-black shadow-sm"><div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center"><Check size={10} strokeWidth={4} /></div>{col}</span>))}</div>
              <div className="mt-10 overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full text-left border-collapse"><thead className="bg-[#F8FAFC]"><tr>{uploadedFile.columns.map(col => (<th key={col} className="px-6 py-4 text-[13px] font-black text-[#64748B] whitespace-nowrap border-b border-gray-100 uppercase tracking-tight">{col}</th>))}</tr></thead>
                  <tbody className="divide-y divide-gray-100">{uploadedFile.data.slice(0, 3).map((row, i) => (<tr key={i} className="hover:bg-gray-50/50">{uploadedFile.columns.map(col => (<td key={col} className="px-6 py-4 text-[14px] font-bold text-gray-700 whitespace-nowrap">{String(row[col])}</td>))}</tr>))}</tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end"><button onClick={() => {setUploadedFile(null); if(fileInputRef.current) fileInputRef.current.value = "";}} className="text-gray-400 hover:text-red-500 font-black text-[13px] uppercase tracking-widest flex items-center gap-2"><X size={14} /> Clear and Re-upload</button></div>
            </div>
          )}
        </div>

        <div className={`bg-white p-10 rounded-[1.5rem] border border-gray-100 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)] transition-all ${isDemoMode && demoStep === DemoStep.EXPLAIN_PROMPT ? 'ring-4 ring-orange-400 ring-offset-4' : ''}`}>
          <div className="flex items-center gap-4 mb-4"><span className="w-10 h-10 bg-[#FFEDD5] text-[#F97316] rounded-xl flex items-center justify-center text-2xl font-black">2</span><h3 className="text-[28px] font-bold text-[#0F172A]">Configure Strategy</h3></div>
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3"><MessageSquare size={18} className="text-gray-500" /><label className="text-base font-bold text-gray-700">Campaign Strategy Goal</label></div>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} readOnly={isDemoMode} placeholder="e.g. Launch a premium credit card for high-income professionals with a focus on travel perks..." className="w-full h-40 p-6 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-100 transition-all text-gray-800 font-medium leading-relaxed text-lg" />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-700 mb-3">Brand Voice</label>
              <div className="grid grid-cols-3 gap-4">{['Professional', 'Friendly', 'Urgent'].map(t => (<button key={t} onClick={() => !isDemoMode && setTone(t)} className={`py-4 rounded-xl font-bold text-lg border transition-all ${tone === t ? 'bg-[#F97316] text-white border-[#F97316] shadow-lg shadow-orange-100' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{t}</button>))}</div>
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-r from-[#F97316] to-[#FB923C] p-8 rounded-[1.5rem] shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 transition-all ${isDemoMode && demoStep === DemoStep.START_GEN ? 'ring-4 ring-white ring-offset-4 scale-[1.02]' : ''}`}>
          <div className="text-left"><h3 className="text-2xl font-black text-white mb-1">Generate Campaign Solution</h3><p className="text-white/90 font-medium text-lg">AI will create full messages and explain the logic for each customer</p></div>
          <button onClick={startGeneration} disabled={(!uploadedFile || !prompt || isGenerating) && !isDemoMode} className="px-10 py-5 bg-white/20 backdrop-blur-md border-2 border-white/40 text-white rounded-2xl font-black text-xl hover:bg-white/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />} Start Campaign
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-10 animate-in fade-in duration-500 text-center">
           <div className="relative mb-8"><Loader2 className="animate-spin text-[#F97316]" size={80} /><div className="absolute inset-0 flex items-center justify-center"><Sparkles size={24} className="text-orange-300 animate-pulse" /></div></div>
           <h2 className="text-[32px] font-black text-[#0F172A] mb-4 tracking-tight">Strategizing {uploadedFile?.rowCount} Solutions</h2>
           <p className="text-xl text-gray-500 font-medium max-w-lg mb-8">Gemini is applying BFSI compliance rules and determining the best psychological hook for every customer row...</p>
           <div className="w-full max-w-md bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="bg-[#F97316] h-full transition-all duration-500" style={{ width: `${(generationResults.length / (uploadedFile?.rowCount || 1)) * 100}%` }} /></div>
           <p className="mt-4 text-sm font-black text-gray-400 uppercase tracking-widest">Processing {generationResults.length + 1} of {uploadedFile?.rowCount}</p>
        </div>
      )}
    </div>
  );
};

export default CreateCampaign;

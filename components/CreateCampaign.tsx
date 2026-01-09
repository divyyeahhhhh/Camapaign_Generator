
import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Upload as UploadIcon, 
  Sparkles,
  X,
  Loader2,
  Edit2,
  Brain,
  Check,
  Shield,
  MessageSquare,
  Eye,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { GoogleGenAI, Type } from "@google/genai";

interface CreateCampaignProps {
  onBack: () => void;
}

interface CustomerData {
  [key: string]: any;
}

interface GeneratedMessage {
  customerId: string;
  customerName: string;
  rowNumber: number;
  subject: string;
  content: string;
  complianceScore: number;
  aiConfidence: number;
  complianceAnalysis: string;
  strategyLogic: string;
  tone: string;
}

const CreateCampaign: React.FC<CreateCampaignProps> = ({ onBack }) => {
  const [tone, setTone] = useState('Professional');
  const [prompt, setPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; rowCount: number; data: CustomerData[]; columns: string[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState<GeneratedMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<'config' | 'results'>('config');
  const [selectedMessage, setSelectedMessage] = useState<GeneratedMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'compliance'>('analysis');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startGeneration = async () => {
    const dataToProcess = uploadedFile?.data || [];
    if (dataToProcess.length === 0 || !prompt) return;
    
    setError(null);
    setIsGenerating(true);
    
    try {
      // Create AI instance inside the handler to ensure fresh environment variable access
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const model = 'gemini-3-flash-preview';
      const results: GeneratedMessage[] = [];
      const limit = Math.min(dataToProcess.length, 10);
      
      for (let i = 0; i < limit; i++) {
        const customer = dataToProcess[i];
        
        try {
          const response = await ai.models.generateContent({
            model,
            contents: `Act as a Senior BFSI Strategist and Compliance Officer. 
            CUSTOMER DATA: ${JSON.stringify(customer)}
            CAMPAIGN GOAL: ${prompt}
            TARGET TONE: ${tone}
            
            TASK:
            1. Generate a personalized marketing message.
            2. Provide 'complianceAnalysis' for banking standards.
            3. Provide 'strategyLogic'.
            4. Score compliance from 0-100.
            5. Set AI Confidence from 0-100.`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  content: { type: Type.STRING },
                  complianceScore: { type: Type.INTEGER },
                  aiConfidence: { type: Type.INTEGER },
                  complianceAnalysis: { type: Type.STRING },
                  strategyLogic: { type: Type.STRING }
                },
                required: ["subject", "content", "complianceScore", "aiConfidence", "complianceAnalysis", "strategyLogic"]
              }
            }
          });

          const text = response.text;
          if (text) {
            const data = JSON.parse(text);
            results.push({
              customerId: customer.customerId || customer.customer_id || `CUST${i+1}`,
              customerName: customer.name || `Customer ${i+1}`,
              rowNumber: i + 1,
              subject: data.subject,
              content: data.content,
              complianceScore: data.complianceScore,
              aiConfidence: data.aiConfidence,
              complianceAnalysis: data.complianceAnalysis,
              strategyLogic: data.strategyLogic,
              tone: tone
            });
            setGenerationResults([...results]);
          }
        } catch (innerError: any) {
          console.error(`Strategic Engine failed for row ${i+1}:`, innerError);
          // If we hit an auth error, stop the loop and notify user
          if (innerError.message?.includes('401') || innerError.message?.includes('API_KEY')) {
            throw new Error("API Authentication Failure. Please verify your environment configuration.");
          }
        }
        
        // Pacing to prevent rate limiting
        await new Promise(r => setTimeout(r, 200));
      }
      
      if (results.length > 0) {
        setCurrentStep('results');
      } else {
        throw new Error("Zero messages generated. Please check your prompt and data format.");
      }

    } catch (err: any) {
      console.error("Critical Engine Failure:", err);
      setError(err.message || "An unexpected error occurred during synthesis.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(sheet) as CustomerData[];
          setUploadedFile({ 
            name: file.name, 
            rowCount: jsonData.length, 
            data: jsonData, 
            columns: jsonData.length > 0 ? Object.keys(jsonData[0]) : [] 
          });
          setError(null);
        } catch (e) {
          setError("Failed to parse file. Please upload a valid CSV or XLSX.");
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  if (currentStep === 'results') {
    const avgScore = generationResults.length > 0 
      ? Math.round(generationResults.reduce((acc, curr) => acc + curr.complianceScore, 0) / generationResults.length) 
      : 0;

    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-20 animate-in fade-in duration-500">
        <header className="px-10 py-6 border-b border-gray-100 bg-white flex justify-between items-center mb-12 sticky top-0 z-20">
          <button onClick={() => setCurrentStep('config')} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Back to Configuration
          </button>
          <div className="text-sm font-bold text-gray-800 tracking-tight">Strategic Review Board</div>
        </header>

        <div className="max-w-[1440px] mx-auto px-10">
          <div className="mb-12">
            <h1 className="text-[44px] font-extrabold text-[#0F172A] mb-2 tracking-tight">Campaign Intelligence Report</h1>
            <p className="text-[18px] text-gray-500 font-medium">
              {generationResults.length} personalized messages synthesized with {avgScore}% average compliance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {[
              { label: 'Total Sync', value: generationResults.length, color: 'text-[#0F172A]' },
              { label: 'Verified', value: generationResults.filter(r => r.complianceScore >= 90).length, color: 'text-green-600' },
              { label: 'Flagged', value: generationResults.filter(r => r.complianceScore < 90).length, color: 'text-orange-500' },
              { label: 'Logic Score', value: `${avgScore}%`, color: 'text-[#F97316]' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <p className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4">{stat.label}</p>
                <p className={`text-[44px] font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] border-b border-gray-100">
                <tr>
                  <th className="px-10 py-6 text-[14px] font-bold text-gray-400 uppercase tracking-wider">Customer Persona</th>
                  <th className="px-10 py-6 text-[14px] font-bold text-gray-400 uppercase tracking-wider">Copy Snippet</th>
                  <th className="px-10 py-6 text-[14px] font-bold text-gray-400 uppercase tracking-wider">Compliance</th>
                  <th className="px-10 py-6 text-[14px] font-bold text-gray-400 uppercase tracking-wider text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {generationResults.map((res, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-10 py-8 font-bold text-[#0F172A] text-[16px]">{res.customerName}</td>
                    <td className="px-10 py-8 text-[15px] text-gray-500 line-clamp-1 max-w-lg font-medium">{res.content}</td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${res.complianceScore >= 90 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                         <span className="text-[14px] font-bold text-gray-700">{res.complianceScore}%</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => { setSelectedMessage(res); setEditedContent(res.content); setIsEditing(false); }} 
                        className="text-[#F97316] font-bold text-sm bg-orange-50 px-4 py-2 rounded-lg hover:bg-[#F97316] hover:text-white transition-all"
                      >
                        View Logic
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedMessage && (
          <div className="fixed inset-0 z-[100] bg-[#0F172A]/80 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                   <h2 className="text-[24px] font-black text-[#0F172A] tracking-tight">Synthesis Audit</h2>
                   <p className="text-[14px] text-gray-500 font-bold uppercase tracking-widest">{selectedMessage.customerName}</p>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><X size={28} /></button>
              </div>
              <div className="p-10 overflow-y-auto space-y-12">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[18px] font-bold text-[#0F172A]">Synthesized Copy</h4>
                    <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-bold text-[#F97316] underline">{isEditing ? 'Cancel Edit' : 'Edit Copy'}</button>
                  </div>
                  {isEditing ? (
                    <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full h-44 p-6 rounded-2xl border-2 border-orange-100 outline-none focus:border-orange-500 font-medium" />
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-2xl text-[17px] text-gray-700 leading-relaxed font-medium border border-gray-100">{selectedMessage.content}</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-8">
                      <h4 className="text-[17px] font-bold mb-4 flex items-center gap-2 text-[#0F172A]"><Brain size={20} className="text-indigo-600" /> Persona Logic</h4>
                      <p className="text-[15px] leading-relaxed text-gray-600 font-medium italic">"{selectedMessage.strategyLogic}"</p>
                   </div>
                   <div className="bg-[#F0FDF4] border border-green-100 rounded-2xl p-8">
                      <h4 className="text-[17px] font-bold mb-4 flex items-center gap-2 text-[#0F172A]"><Shield size={20} className="text-green-600" /> Compliance Note</h4>
                      <p className="text-[15px] leading-relaxed text-gray-600 font-medium italic">"{selectedMessage.complianceAnalysis}"</p>
                   </div>
                </div>
              </div>
              <div className="p-10 border-t border-gray-100 flex justify-end gap-4 bg-gray-50">
                 <button onClick={() => setSelectedMessage(null)} className="px-8 py-3 font-bold text-gray-500 hover:text-gray-900">Close Audit</button>
                 <button className="px-8 py-3 bg-[#F97316] text-white rounded-xl font-bold shadow-lg shadow-orange-100">Approve Message</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans animate-in fade-in duration-700">
      <header className="px-10 py-6 border-b border-gray-100 bg-white flex justify-between items-center mb-12 sticky top-0 z-20 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#F97316] transition-colors">
          <ArrowLeft size={16} /> Exit Workspace
        </button>
        <div className="text-sm font-black text-gray-400 uppercase tracking-widest">Newgen Strategic Studio</div>
      </header>

      <div className="max-w-[1440px] mx-auto px-10">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-6">
            <Sparkles size={14} className="text-[#F97316]" />
            <span className="text-[12px] font-black text-[#F97316] uppercase tracking-[0.2em]">Strategic Mode Active</span>
          </div>
          <h1 className="text-[64px] font-black text-[#0F172A] mb-3 tracking-tighter leading-none">Campaign Builder</h1>
          <p className="text-[21px] text-gray-400 font-medium max-w-2xl">Fuel your high-stakes marketing with precision reasoning and automated compliance.</p>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 animate-in slide-in-from-top-2">
            <AlertCircle size={24} />
            <p className="font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-10">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-12 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-12">
              <div className="flex items-start gap-8">
                <span className="w-16 h-16 bg-[#FFEDD5] text-[#F97316] rounded-2xl flex items-center justify-center text-[28px] font-black shadow-inner">1</span>
                <div>
                  <h2 className="text-[32px] font-black text-[#0F172A] mb-2 tracking-tight">Lead Matrix</h2>
                  <p className="text-[18px] text-gray-400 font-medium">Inject your audience dataset (CSV/XLSX).</p>
                </div>
              </div>
            </div>

            {!uploadedFile ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed border-gray-100 rounded-[2rem] p-24 text-center cursor-pointer hover:bg-orange-50/10 hover:border-orange-200 transition-all group">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx" />
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                   <UploadIcon size={32} className="text-[#F97316]" />
                </div>
                <p className="text-[22px] font-bold text-gray-300">Drop lead matrix file here</p>
                <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">or click to browse</p>
              </div>
            ) : (
              <div className="bg-[#F0FDF4] border border-[#DCFCE7] p-10 rounded-[2rem] flex items-center justify-between animate-in zoom-in-95">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-100">
                    <Check size={36} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-[22px] font-black text-[#0F172A] mb-1">{uploadedFile.name}</h4>
                    <p className="text-[14px] text-green-700 font-black uppercase tracking-[0.25em]">{uploadedFile.rowCount} Nodes Mapped</p>
                  </div>
                </div>
                <button onClick={() => setUploadedFile(null)} className="p-4 hover:bg-white rounded-2xl text-gray-300 hover:text-red-500 transition-all shadow-sm"><X size={28} /></button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-12 transition-all hover:shadow-md">
            <div className="flex items-start gap-8 mb-12">
              <span className="w-16 h-16 bg-[#FFEDD5] text-[#F97316] rounded-2xl flex items-center justify-center text-[28px] font-black shadow-inner">2</span>
              <div>
                 <h2 className="text-[32px] font-black text-[#0F172A] mb-2 tracking-tight">Campaign Thesis</h2>
                 <p className="text-[18px] text-gray-400 font-medium">Define your strategic objective and tone.</p>
              </div>
            </div>
            <div className="space-y-12">
              <div className="space-y-4">
                 <label className="text-[14px] font-black text-gray-400 uppercase tracking-widest ml-1">Strategic Prompt</label>
                 <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Synthesize a wealth management offer focusing on high-yield bonds for middle-aged professionals..."
                    className="w-full h-44 p-8 rounded-[2rem] border-2 border-gray-100 outline-none focus:border-orange-500 transition-all font-medium text-[18px] text-[#0F172A] placeholder:text-gray-200 bg-gray-50/30"
                 />
              </div>
              <div className="space-y-6">
                <label className="text-[14px] font-black text-gray-400 uppercase tracking-widest ml-1">Vocal Profile</label>
                <div className="flex gap-6">
                  {['Professional', 'Friendly', 'Urgent'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTone(t)}
                      className={`flex-1 py-6 rounded-[1.5rem] border-2 font-black text-[16px] uppercase tracking-widest transition-all ${tone === t ? 'bg-[#F97316] text-white border-[#F97316] shadow-xl shadow-orange-100 scale-[1.03]' : 'bg-white text-gray-300 border-gray-50 hover:border-gray-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F172A] rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
             <div className="relative z-10">
                <h3 className="text-[32px] font-black text-white mb-2 tracking-tight">Execute Synthesis?</h3>
                <p className="text-[18px] text-gray-400 font-medium">Reasoning cycles will prioritize high compliance standards.</p>
             </div>
             <button 
                onClick={startGeneration}
                disabled={!uploadedFile || !prompt || isGenerating}
                className="mt-8 md:mt-0 px-12 py-5 bg-[#F97316] text-white rounded-2xl font-black text-[18px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-900/40 disabled:opacity-50 disabled:grayscale relative z-10"
             >
                {isGenerating ? <Loader2 className="animate-spin" /> : 'Start Engine'}
             </button>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-[#0F172A]/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
           <div className="w-48 h-48 rounded-full border-[10px] border-orange-500/10 flex items-center justify-center mb-16 relative">
              <Loader2 className="animate-spin text-[#F97316] absolute" size={120} strokeWidth={1.5} />
              <Brain size={48} className="text-white animate-pulse" />
           </div>
           <h2 className="text-[64px] font-black text-white mb-6 tracking-tighter">Strategic Cycle Active</h2>
           <p className="text-[22px] text-gray-400 max-w-2xl leading-relaxed font-medium">
             Synthesizing {generationResults.length} / {uploadedFile?.rowCount} compliant marketing personas.
           </p>
           <div className="w-full max-w-lg bg-white/5 h-2 rounded-full mt-12 overflow-hidden border border-white/10">
              <div 
                className="h-full bg-[#F97316] transition-all duration-500 shadow-[0_0_20px_#F97316]" 
                style={{ width: `${(generationResults.length / (uploadedFile?.rowCount || 1)) * 100}%` }}
              />
           </div>
        </div>
      )}
    </div>
  );
};

export default CreateCampaign;

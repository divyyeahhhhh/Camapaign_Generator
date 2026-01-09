
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
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { generateCampaignMessage } from '../services/gemini.ts';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Concurrency lock to prevent looping in production environments
  const generationTaskActive = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startGeneration = async () => {
    if (generationTaskActive.current) return;
    const dataToProcess = uploadedFile?.data || [];
    if (dataToProcess.length === 0 || !prompt) return;
    
    generationTaskActive.current = true;
    setError(null);
    setIsGenerating(true);
    setGenerationResults([]);
    
    try {
      const results: GeneratedMessage[] = [];
      const limit = Math.min(dataToProcess.length, 10);
      
      for (let i = 0; i < limit; i++) {
        const customer = dataToProcess[i];
        
        try {
          const data = await generateCampaignMessage(customer, prompt, tone);
          
          const newMessage: GeneratedMessage = {
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
          };

          results.push(newMessage);
          // Functional update to avoid closure stale state
          setGenerationResults(prev => [...prev, newMessage]);
        } catch (rowError: any) {
          console.error(`Row ${i+1} failed:`, rowError);
          // If the error is a quota or auth error, stop entirely
          if (rowError.message?.includes('401') || rowError.message?.includes('429')) {
             throw new Error("Strategic Service unavailable. Check environment API key or usage limits.");
          }
        }
        // Small delay to prevent blocking the UI thread
        await new Promise(r => setTimeout(r, 100));
      }
      
      if (results.length > 0) {
        setCurrentStep('results');
      } else {
        throw new Error("The Strategic Engine failed to synthesize any compliant copy.");
      }
    } catch (err: any) {
      setError(err.message || "Synthesis failed unexpectedly.");
      console.error("Critical Generation Failure:", err);
    } finally {
      setIsGenerating(false);
      generationTaskActive.current = false;
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
          setError("File parsing failed. Please use a clean CSV or XLSX file.");
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
        <header className="px-10 py-6 border-b border-gray-100 bg-white flex justify-between items-center mb-12 sticky top-0 z-20 shadow-sm">
          <button onClick={() => setCurrentStep('config')} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Back to Config
          </button>
          <div className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Audit Terminal</div>
        </header>

        <div className="max-w-[1440px] mx-auto px-10">
          <div className="mb-12">
            <h1 className="text-[44px] font-black text-[#0F172A] mb-2 tracking-tighter">Strategic Synthesis Results</h1>
            <p className="text-[18px] text-gray-500 font-medium">Verified {generationResults.length} marketing personas for deployment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {[
              { label: 'Total Nodes', value: generationResults.length, color: 'text-[#0F172A]' },
              { label: 'High Trust', value: generationResults.filter(r => r.complianceScore >= 90).length, color: 'text-green-600' },
              { label: 'At Risk', value: generationResults.filter(r => r.complianceScore < 90).length, color: 'text-orange-500' },
              { label: 'Global Compliance', value: `${avgScore}%`, color: 'text-[#F97316]' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-4">{stat.label}</p>
                <p className={`text-[44px] font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] border-b border-gray-100">
                <tr>
                  <th className="px-10 py-6 text-[14px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-10 py-6 text-[14px] font-bold text-gray-400 uppercase tracking-wider">Synthesized Copy</th>
                  <th className="px-10 py-6 text-[14px] font-bold text-gray-400 uppercase tracking-wider">Compliance</th>
                  <th className="px-10 py-6 text-[14px] font-bold text-gray-400 uppercase tracking-wider text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {generationResults.map((res, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-8 font-bold text-[#0F172A]">{res.customerName}</td>
                    <td className="px-10 py-8 text-[15px] text-gray-600 line-clamp-1 max-w-lg">{res.content}</td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${res.complianceScore >= 90 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        {res.complianceScore}%
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button onClick={() => { setSelectedMessage(res); setEditedContent(res.content); setIsEditing(false); }} className="text-[#F97316] font-bold text-sm bg-orange-50 px-4 py-2 rounded-lg">View Analysis</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedMessage && (
          <div className="fixed inset-0 z-[100] bg-[#0F172A]/80 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-[24px] font-black text-[#0F172A] tracking-tighter">Strategic Reasoning Audit</h2>
                  <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">{selectedMessage.customerName}</p>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><X size={28} /></button>
              </div>
              <div className="p-12 overflow-y-auto space-y-12">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[17px] font-bold text-[#0F172A]">Synthesized Output</h4>
                    <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-bold text-[#F97316]">{isEditing ? 'Cancel' : 'Edit Copy'}</button>
                  </div>
                  {isEditing ? (
                    <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full h-44 p-6 rounded-2xl border-2 border-orange-100 outline-none focus:border-orange-500 font-medium text-[16px]" />
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-2xl text-[18px] text-gray-700 leading-relaxed font-medium border border-gray-100">"{selectedMessage.content}"</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8">
                      <h4 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-[#0F172A]"><Brain size={18} className="text-indigo-600" /> Strategic Logic</h4>
                      <p className="text-[15px] leading-relaxed text-gray-600 font-medium italic">"{selectedMessage.strategyLogic}"</p>
                   </div>
                   <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8">
                      <h4 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-[#0F172A]"><Shield size={18} className="text-emerald-600" /> Compliance Audit</h4>
                      <p className="text-[15px] leading-relaxed text-gray-600 font-medium italic">"{selectedMessage.complianceAnalysis}"</p>
                   </div>
                </div>
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
          <ArrowLeft size={16} /> Exit Creation
        </button>
        <div className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Newgen Strategic Studio</div>
      </header>

      <div className="max-w-[1440px] mx-auto px-10">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-6">
            <Sparkles size={14} className="text-[#F97316]" />
            <span className="text-[11px] font-black text-[#F97316] uppercase tracking-[0.2em]">Strategic Mode: Online</span>
          </div>
          <h1 className="text-[64px] font-black text-[#0F172A] mb-3 tracking-tighter leading-tight">Campaign Workspace</h1>
          <p className="text-[21px] text-gray-400 font-medium max-w-2xl">Deploy high-stakes marketing personas using our consolidated reasoning hub.</p>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 animate-in slide-in-from-top-2">
            <AlertTriangle size={24} />
            <div className="font-bold">{error}</div>
          </div>
        )}

        <div className="space-y-12">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-12 transition-all hover:shadow-md">
            <div className="flex items-start gap-8 mb-12">
              <span className="w-16 h-16 bg-[#FFEDD5] text-[#F97316] rounded-2xl flex items-center justify-center text-[28px] font-black">1</span>
              <div>
                <h2 className="text-[32px] font-black text-[#0F172A] mb-2 tracking-tight">Customer Matrix</h2>
                <p className="text-[18px] text-gray-400 font-medium">Inject your audience dataset (CSV/XLSX) into the reasoning loop.</p>
              </div>
            </div>

            {!uploadedFile ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-24 text-center cursor-pointer hover:bg-orange-50/10 hover:border-orange-200 transition-all group">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx" />
                <UploadIcon size={36} className="mx-auto text-[#F97316] mb-8 group-hover:scale-110 transition-transform" />
                <p className="text-[22px] font-bold text-gray-300">Drop lead data here or browse</p>
              </div>
            ) : (
              <div className="bg-[#F0FDF4] border border-[#DCFCE7] p-10 rounded-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Check size={36} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-[22px] font-black text-[#0F172A] mb-1">{uploadedFile.name}</h4>
                    <p className="text-[14px] text-green-700 font-black uppercase tracking-[0.25em]">{uploadedFile.rowCount} Nodes Prepared</p>
                  </div>
                </div>
                <button onClick={() => setUploadedFile(null)} className="p-4 hover:bg-white rounded-2xl text-gray-300 hover:text-red-500 transition-all"><X size={28} /></button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-12 transition-all hover:shadow-md">
            <div className="flex items-start gap-8 mb-12">
              <span className="w-16 h-16 bg-[#FFEDD5] text-[#F97316] rounded-2xl flex items-center justify-center text-[28px] font-black">2</span>
              <h2 className="text-[32px] font-black text-[#0F172A] tracking-tight">Strategy Thesis</h2>
            </div>
            <div className="space-y-12">
              <div className="space-y-4">
                 <label className="text-[14px] font-black text-gray-400 uppercase tracking-widest">Campaign Goal</label>
                 <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your marketing objective..."
                    className="w-full h-44 p-8 rounded-[2rem] border-2 border-gray-100 outline-none focus:border-orange-500 transition-all font-medium text-[18px]"
                 />
              </div>
              <div className="space-y-6">
                <label className="text-[14px] font-black text-gray-400 uppercase tracking-widest">Vocal Profile</label>
                <div className="flex gap-6">
                  {['Professional', 'Friendly', 'Urgent'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTone(t)}
                      className={`flex-1 py-6 rounded-2xl border-2 font-black text-[16px] uppercase tracking-widest transition-all ${tone === t ? 'bg-[#F97316] text-white border-[#F97316] shadow-xl shadow-orange-100' : 'bg-white text-gray-300 border-gray-50 hover:border-gray-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F172A] rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl">
             <div className="text-white">
                <h3 className="text-[32px] font-black mb-2 tracking-tight">Execute Strategy Engine?</h3>
                <p className="text-[18px] text-gray-400 font-medium">Engine will run a loop of {Math.min(uploadedFile?.rowCount || 0, 10)} nodes.</p>
             </div>
             <button 
                onClick={startGeneration}
                disabled={!uploadedFile || !prompt || isGenerating}
                className="mt-8 md:mt-0 px-12 py-5 bg-[#F97316] text-white rounded-2xl font-black text-[18px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-900/40 disabled:opacity-50"
             >
                {isGenerating ? <Loader2 className="animate-spin" /> : 'Start Engine'}
             </button>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-[#0F172A]/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center">
           <div className="w-32 h-32 rounded-full border-4 border-orange-500/20 flex items-center justify-center mb-12">
              <Loader2 className="animate-spin text-[#F97316]" size={64} />
           </div>
           <h2 className="text-[48px] font-black text-white mb-6">Strategic Cycle Active</h2>
           <p className="text-[22px] text-gray-400 max-w-2xl leading-relaxed">Synthesizing personalized personas. Current Progress: {generationResults.length} / {Math.min(uploadedFile?.rowCount || 0, 10)} nodes complete.</p>
           <div className="w-full max-w-md bg-white/5 h-2 rounded-full mt-12 overflow-hidden border border-white/10">
              <div 
                className="h-full bg-[#F97316] transition-all duration-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]" 
                style={{ width: `${(generationResults.length / Math.min(uploadedFile?.rowCount || 1, 10)) * 100}%` }}
              />
           </div>
        </div>
      )}
    </div>
  );
};

export default CreateCampaign;

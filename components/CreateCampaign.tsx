
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
  Check,
  Info,
  Shield,
  Target,
  MessageSquare,
  Eye,
  ChevronRight,
  AlertCircle
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

const CreateCampaign: React.FC<CreateCampaignProps> = ({ onBack, isDemoMode = false, demoStep, setDemoStep }) => {
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

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const startGeneration = async () => {
    const dataToProcess = uploadedFile?.data || [];
    if (dataToProcess.length === 0 || !prompt) return;
    
    setError(null);
    setIsGenerating(true);
    
    try {
      const results: GeneratedMessage[] = [];
      const limit = Math.min(dataToProcess.length, 10);
      
      for (let i = 0; i < limit; i++) {
        const customer = dataToProcess[i];
        // Initialize right before making the call to ensure process.env is ready
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const model = 'gemini-3-flash-preview';

        const response = await ai.models.generateContent({
          model,
          contents: `Act as a Senior BFSI Strategist and Compliance Officer. 
          CUSTOMER DATA: ${JSON.stringify(customer)}
          CAMPAIGN GOAL: ${prompt}
          TARGET TONE: ${tone}
          
          TASK:
          1. Generate a high-converting personalized marketing message.
          2. Provide 'complianceAnalysis' explaining in detail why this message is safe for banking standards.
          3. Provide 'strategyLogic' explaining the reasoning behind the specific hooks used for this individual.
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

        const data = JSON.parse(response.text || '{}');
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
        await sleep(150);
      }
      setCurrentStep('results');
    } catch (err: any) {
      console.error(err);
      setError("Strategic Reasoning Engine Failure. Please check if API Key is set in your environment.");
    } finally {
      setIsGenerating(false);
    }
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
        setUploadedFile({ 
          name: file.name, 
          rowCount: jsonData.length, 
          data: jsonData, 
          columns: jsonData.length > 0 ? Object.keys(jsonData[0]) : [] 
        });
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = "customer_id,name,phone,email,age,location,occupation\nCUST001,Rajesh Kumar,919876543210,rajesh@example.com,35,Mumbai,Software Engineer\nCUST002,Priya Sharma,919876543211,priya@example.com,28,Delhi,Marketing Manager\nCUST003,Amit Patel,919876543212,amit@example.com,45,Bangalore,Business Owner";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "customer_data_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (currentStep === 'results') {
    const avgScore = generationResults.length > 0 
      ? Math.round(generationResults.reduce((acc, curr) => acc + curr.complianceScore, 0) / generationResults.length) 
      : 0;

    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-20 animate-in fade-in duration-500">
        <header className="px-10 py-6 border-b border-gray-100 bg-white flex justify-between items-center mb-12">
          <button onClick={() => setCurrentStep('config')} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Back to Configuration
          </button>
          <div className="text-sm font-bold text-gray-800">
            Divya Sivakumar <span className="text-gray-400 mx-2">•</span> <span className="text-gray-400">Free</span>
          </div>
        </header>

        <div className="max-w-[1440px] mx-auto px-10">
          <div className="mb-12">
            <h1 className="text-[44px] font-bold text-[#0F172A] mb-2 tracking-tight">Review Generated Campaign</h1>
            <p className="text-[18px] text-gray-500 font-medium">
              {generationResults.length} messages generated successfully with {avgScore}% average compliance score
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {[
              { label: 'Total Messages', value: generationResults.length, color: 'text-[#0F172A]' },
              { label: 'Passed', value: generationResults.filter(r => r.complianceScore >= 90).length, color: 'text-green-600' },
              { label: 'Failed', value: generationResults.filter(r => r.complianceScore < 90).length, color: 'text-red-600' },
              { label: 'Avg Score', value: `${avgScore}%`, color: 'text-[#0F172A]' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
                <p className="text-[15px] font-medium text-gray-500 mb-4">{stat.label}</p>
                <p className={`text-[44px] font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-10 border-b border-gray-50">
              <h3 className="text-[26px] font-bold text-[#0F172A] mb-2">Generated Messages</h3>
              <p className="text-[16px] text-gray-500 font-medium">Review and edit AI-generated messages with compliance scores</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8FAFC] border-b border-gray-100">
                  <tr>
                    <th className="px-10 py-6 text-[14px] font-bold text-gray-500">Customer</th>
                    <th className="px-10 py-6 text-[14px] font-bold text-gray-500">Message Preview</th>
                    <th className="px-10 py-6 text-[14px] font-bold text-gray-500">Compliance</th>
                    <th className="px-10 py-6 text-[14px] font-bold text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {generationResults.map((res, i) => (
                    <tr key={i} className={`hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? 'bg-[#FFFBF5]/20' : ''}`}>
                      <td className="px-10 py-8">
                        <p className="font-bold text-[17px] text-[#0F172A]">{res.customerName}</p>
                        <p className="text-[13px] text-gray-400 font-medium mt-0.5 uppercase tracking-wider">Row {res.rowNumber}</p>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-[15px] text-gray-600 line-clamp-2 max-w-lg leading-relaxed">{res.content}</p>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-bold ${res.complianceScore >= 95 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                          <Check size={14} strokeWidth={3} /> {res.complianceScore}% Compliant
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button onClick={() => { setSelectedMessage(res); setEditedContent(res.content); setIsEditing(false); }} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#F97316] ml-auto transition-colors">
                          <Eye size={18} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedMessage && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden">
              <div className="px-10 py-7 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-[22px] font-bold text-[#0F172A]">Message Details</h2>
                  <p className="text-[14px] text-gray-500 font-medium">{selectedMessage.customerName} - Row {selectedMessage.rowNumber}</p>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={26} className="text-gray-400" /></button>
              </div>

              <div className="p-10 overflow-y-auto space-y-10">
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[17px] font-bold text-[#0F172A]">Message Content</h4>
                    <button 
                      onClick={() => isEditing ? (setSelectedMessage({...selectedMessage, content: editedContent}), setIsEditing(false)) : setIsEditing(true)} 
                      className="px-5 py-2.5 border border-gray-200 rounded-xl text-[14px] font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      <Edit2 size={15} /> {isEditing ? 'Save Changes' : 'Edit'}
                    </button>
                  </div>
                  {isEditing ? (
                    <textarea 
                      value={editedContent} 
                      onChange={(e) => setEditedContent(e.target.value)} 
                      className="w-full h-56 p-6 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-[15px] leading-relaxed font-medium"
                    />
                  ) : (
                    <div className="bg-white border border-gray-100 p-8 rounded-xl text-[16px] text-gray-600 leading-relaxed font-medium whitespace-pre-wrap shadow-inner min-h-[180px]">
                      {selectedMessage.content}
                    </div>
                  )}
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
                  <div className="flex border-b border-gray-100 bg-[#F8FAFC]">
                    <button 
                      onClick={() => setActiveTab('analysis')}
                      className={`flex-1 py-5 text-[15px] font-bold transition-all border-b-2 ${activeTab === 'analysis' ? 'bg-white border-orange-500 text-[#0F172A]' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'}`}
                    >
                      Content Analysis
                    </button>
                    <button 
                      onClick={() => setActiveTab('compliance')}
                      className={`flex-1 py-5 text-[15px] font-bold transition-all border-b-2 ${activeTab === 'compliance' ? 'bg-white border-orange-500 text-[#0F172A]' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'}`}
                    >
                      Compliance Check
                    </button>
                  </div>
                  <div className="p-10 bg-white">
                    {activeTab === 'compliance' ? (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <div className="flex items-center gap-3 mb-2">
                          <Shield size={22} className="text-green-600" />
                          <h4 className="text-[19px] font-bold text-[#0F172A]">How was compliance evaluated?</h4>
                        </div>
                        <p className="text-[15px] text-gray-500 font-medium">AI compliance checking and regulatory analysis</p>
                        
                        <div className="space-y-5">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Sparkles size={18} className="text-green-600" />
                              <span className="text-[15px] font-bold text-green-600">AI Confidence</span>
                            </div>
                            <span className="text-[16px] font-bold text-green-600">{selectedMessage.aiConfidence}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${selectedMessage.aiConfidence}%` }}></div>
                          </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50">
                          <h5 className="text-[15px] font-bold text-[#0F172A] mb-4">Compliance Reasoning:</h5>
                          <div className="bg-emerald-50/30 p-6 rounded-xl border border-emerald-100/50">
                            <p className="text-[15px] text-[#334155] leading-relaxed font-medium italic">"{selectedMessage.complianceAnalysis}"</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <div className="flex items-center gap-3">
                          <Brain size={22} className="text-indigo-600" />
                          <h4 className="text-[19px] font-bold text-[#0F172A]">Strategic Reasoning</h4>
                        </div>
                        <div className="bg-indigo-50/30 p-7 rounded-xl border border-indigo-100/50">
                          <h5 className="text-[15px] font-bold text-indigo-700 mb-4 uppercase tracking-wider">AI Thesis:</h5>
                          <p className="text-[16px] text-[#334155] leading-relaxed font-medium">
                            {selectedMessage.strategyLogic}
                          </p>
                        </div>
                      </div>
                    )}
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
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="text-sm font-bold text-gray-800">
          Divya Sivakumar <span className="text-gray-400 mx-2">•</span> <span className="text-gray-400">Free</span>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-10">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 mb-6">
            <Sparkles size={14} className="text-gray-600" />
            <span className="text-[12px] font-bold text-gray-800 uppercase tracking-widest">AI-Powered Campaign</span>
          </div>
          <h1 className="text-[52px] font-bold text-[#0F172A] mb-3 tracking-tighter leading-none">Create New Campaign</h1>
          <p className="text-[21px] text-gray-500 font-medium">Upload your customer data and configure your marketing campaign</p>
        </div>

        <div className="space-y-10">
          {/* Step 1: Upload */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="p-12">
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-start gap-6">
                  <span className="w-12 h-12 bg-[#FFEDD5] text-[#F97316] rounded-xl flex items-center justify-center text-[24px] font-bold shrink-0">1</span>
                  <div>
                    <h2 className="text-[26px] font-bold text-[#0F172A] mb-2">Upload Customer Data</h2>
                    <p className="text-[17px] text-gray-500 font-medium max-w-2xl leading-relaxed">
                      Upload a CSV file with your customer data (max 10 rows). Required columns: customer_id, name, phone, email, age, location, occupation
                    </p>
                  </div>
                </div>
                <button onClick={handleDownloadSample} className="px-6 py-3.5 border border-gray-200 rounded-xl text-[15px] font-bold text-[#1E293B] hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2">
                  <Download size={20} /> Download Sample
                </button>
              </div>

              {!uploadedFile ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-24 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/5 transition-all group relative"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx,.xls" />
                  <div className="w-24 h-24 bg-[#FFF7ED] rounded-full flex items-center justify-center mx-auto mb-10 group-hover:scale-110 group-hover:bg-[#F97316] transition-all">
                    <UploadIcon size={36} className="text-[#F97316] group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-[22px] font-bold text-gray-300 mb-2 group-hover:text-gray-400 transition-colors">Drag & drop your CSV file here</p>
                  <p className="text-[17px] text-[#64748B] font-medium mb-1">or click to browse</p>
                  <p className="text-[15px] text-[#94A3B8] font-medium mt-6">Supports CSV, XLS, XLSX (max 10 rows)</p>
                </div>
              ) : (
                <div className="bg-[#F0FDF4] border border-[#DCFCE7] p-10 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-[#22C55E] rounded-full flex items-center justify-center text-white shadow-xl">
                      <Check size={36} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-bold text-[#0F172A] mb-1">{uploadedFile.name}</h4>
                      <p className="text-[15px] text-green-700 font-bold uppercase tracking-[0.2em]">{uploadedFile.rowCount} Customer Profiles Ready</p>
                    </div>
                  </div>
                  <button onClick={() => setUploadedFile(null)} className="p-4 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all">
                    <X size={28} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Configure */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="p-12">
              <div className="flex items-start gap-6 mb-12">
                <span className="w-12 h-12 bg-[#FFEDD5] text-[#F97316] rounded-xl flex items-center justify-center text-[24px] font-bold shrink-0">2</span>
                <div>
                  <h2 className="text-[26px] font-bold text-[#0F172A] mb-2">Configure Campaign</h2>
                  <p className="text-[17px] text-gray-500 font-medium">Set your campaign parameters and messaging preferences</p>
                </div>
              </div>

              <div className="space-y-10">
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-[#1E293B]" />
                    <label className="text-[17px] font-bold text-[#1E293B]">Campaign Prompt</label>
                  </div>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Generate a personalized credit card offer highlighting cashback benefits for each customer in the CSV..."
                    className="w-full h-44 p-7 rounded-xl border border-gray-200 bg-white outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-[16px] font-medium text-gray-900 placeholder:text-gray-300 shadow-inner"
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-[17px] font-bold text-[#1E293B] block">Message Tone</label>
                  <div className="flex gap-5">
                    {['Professional', 'Friendly', 'Urgent'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setTone(t)}
                        className={`flex-1 py-5 px-8 rounded-xl border-2 font-bold text-[16px] transition-all ${tone === t ? 'bg-[#F97316] text-white border-[#F97316] shadow-xl shadow-orange-100 scale-[1.02]' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start CTA */}
          <div className="bg-[#F97316] rounded-2xl p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-orange-200 overflow-hidden relative group">
             <div className="relative z-10">
                <h3 className="text-[28px] font-extrabold text-[#0F172A] mb-1">Ready to Generate?</h3>
                <p className="text-[18px] text-white font-medium opacity-90">Review your settings and start the campaign generation</p>
             </div>
             <button 
                onClick={startGeneration}
                disabled={!uploadedFile || !prompt || isGenerating}
                className="mt-8 md:mt-0 px-12 py-5 bg-[#FF8D4D] text-white rounded-xl font-bold text-[20px] flex items-center gap-3 hover:bg-[#EA580C] hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:grayscale relative z-10"
             >
                <Sparkles size={22} /> Start Campaign
             </button>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-[#0F172A]/90 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
           <div className="relative mb-16">
              <div className="w-40 h-40 rounded-full border-[8px] border-orange-500/10 flex items-center justify-center">
                 <Loader2 className="animate-spin text-orange-500" size={80} strokeWidth={2} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Brain size={40} className="text-white animate-pulse" />
              </div>
           </div>
           <h2 className="text-[56px] font-black text-white mb-6 tracking-tighter leading-none">Synthesizing Logic...</h2>
           <p className="text-[22px] text-gray-400 font-medium max-w-3xl mb-16 leading-relaxed">
             Our reasoning hub is building custom strategy matrices and validating copy against current compliance datasets.
           </p>
           <div className="w-full max-w-2xl bg-white/5 rounded-full h-4 overflow-hidden shadow-2xl border border-white/5 mb-8">
              <div 
                className="bg-[#F97316] h-full transition-all duration-1000 shadow-[0_0_30px_rgba(249,115,22,0.8)]" 
                style={{ width: `${(generationResults.length / (uploadedFile?.rowCount || 1)) * 100}%` }} 
              />
           </div>
           <p className="text-[14px] font-black text-gray-500 uppercase tracking-[0.6em]">Reasoning Cycle: {generationResults.length} / {uploadedFile?.rowCount || '0'}</p>
        </div>
      )}
    </div>
  );
};

export default CreateCampaign;


import React, { useState, useRef, useEffect } from 'react';
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
  Eye
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startGeneration = async () => {
    const dataToProcess = uploadedFile?.data || [];
    if (dataToProcess.length === 0 || !prompt) return;
    
    setIsGenerating(true);
    
    try {
      // Initialize right before use to ensure API key is captured
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const model = 'gemini-3-flash-preview';
      const results: GeneratedMessage[] = [];
      const limit = Math.min(dataToProcess.length, 10);
      
      for (let i = 0; i < limit; i++) {
        const customer = dataToProcess[i];
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
        // Small delay for natural pacing
        await new Promise(r => setTimeout(r, 100));
      }
      setCurrentStep('results');
    } catch (err: any) {
      console.error("Strategic Engine Error:", err);
      alert("Error initializing Strategic Engine. Please check connectivity or environment configuration.");
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
            Strategic Review Mode
          </div>
        </header>

        <div className="max-w-[1440px] mx-auto px-10">
          <div className="mb-12">
            <h1 className="text-[44px] font-bold text-[#0F172A] mb-2 tracking-tight">Review Generated Campaign</h1>
            <p className="text-[18px] text-gray-500 font-medium">
              {generationResults.length} messages generated with {avgScore}% average compliance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[15px] font-medium text-gray-500 mb-4">Total Messages</p>
              <p className="text-[44px] font-bold text-[#0F172A]">{generationResults.length}</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[15px] font-medium text-gray-500 mb-4">Passed Compliance</p>
              <p className="text-[44px] font-bold text-green-600">{generationResults.filter(r => r.complianceScore >= 90).length}</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[15px] font-medium text-gray-500 mb-4">Requires Review</p>
              <p className="text-[44px] font-bold text-orange-500">{generationResults.filter(r => r.complianceScore < 90).length}</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[15px] font-medium text-gray-500 mb-4">Avg Compliance</p>
              <p className="text-[44px] font-bold text-[#F97316]">{avgScore}%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] border-b border-gray-100">
                <tr>
                  <th className="px-10 py-6 text-[14px] font-bold text-gray-500">Customer</th>
                  <th className="px-10 py-6 text-[14px] font-bold text-gray-500">Preview</th>
                  <th className="px-10 py-6 text-[14px] font-bold text-gray-500">Compliance</th>
                  <th className="px-10 py-6 text-[14px] font-bold text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {generationResults.map((res, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-10 py-8">
                      <p className="font-bold text-[#0F172A]">{res.customerName}</p>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-[15px] text-gray-600 line-clamp-1 max-w-lg">{res.content}</p>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${res.complianceScore >= 90 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                        {res.complianceScore}% Compliant
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button onClick={() => { setSelectedMessage(res); setEditedContent(res.content); setIsEditing(false); }} className="text-[#F97316] font-bold text-sm flex items-center justify-end gap-2 ml-auto">
                        <Eye size={16} /> Review Logic
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedMessage && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              <div className="px-10 py-7 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-[22px] font-bold text-[#0F172A]">AI Message Reasoning</h2>
                  <p className="text-[14px] text-gray-500 font-medium">{selectedMessage.customerName}</p>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={26} className="text-gray-400" /></button>
              </div>

              <div className="p-10 overflow-y-auto space-y-10">
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[17px] font-bold text-[#0F172A]">Generated Content</h4>
                    <button 
                      onClick={() => isEditing ? (setSelectedMessage({...selectedMessage, content: editedContent}), setIsEditing(false)) : setIsEditing(true)} 
                      className="px-5 py-2 border border-gray-200 rounded-xl text-[14px] font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-all"
                    >
                      <Edit2 size={15} /> {isEditing ? 'Save Changes' : 'Edit Copy'}
                    </button>
                  </div>
                  {isEditing ? (
                    <textarea 
                      value={editedContent} 
                      onChange={(e) => setEditedContent(e.target.value)} 
                      className="w-full h-40 p-6 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-orange-500 transition-all text-[15px] leading-relaxed"
                    />
                  ) : (
                    <div className="bg-gray-50 border border-gray-100 p-8 rounded-xl text-[16px] text-gray-600 leading-relaxed font-medium">
                      {selectedMessage.content}
                    </div>
                  )}
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex border-b border-gray-100 bg-[#F8FAFC]">
                    <button 
                      onClick={() => setActiveTab('analysis')}
                      className={`flex-1 py-5 text-[15px] font-bold transition-all border-b-2 ${activeTab === 'analysis' ? 'bg-white border-orange-500 text-[#0F172A]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                      Strategic Reasoning
                    </button>
                    <button 
                      onClick={() => setActiveTab('compliance')}
                      className={`flex-1 py-5 text-[15px] font-bold transition-all border-b-2 ${activeTab === 'compliance' ? 'bg-white border-orange-500 text-[#0F172A]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                      Compliance Logic
                    </button>
                  </div>
                  <div className="p-10 bg-white">
                    {activeTab === 'compliance' ? (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <div className="flex items-center gap-3">
                          <Shield size={22} className="text-green-600" />
                          <h4 className="text-[19px] font-bold text-[#0F172A]">Evaluation Confidence</h4>
                        </div>
                        <div className="space-y-5">
                          <div className="flex justify-between items-center">
                            <span className="text-[15px] font-bold text-green-600">AI Trust Score</span>
                            <span className="text-[16px] font-bold text-green-600">{selectedMessage.aiConfidence}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${selectedMessage.aiConfidence}%` }}></div>
                          </div>
                        </div>
                        <div className="pt-8 border-t border-gray-50">
                          <h5 className="text-[15px] font-bold text-[#0F172A] mb-4">Compliance Narrative:</h5>
                          <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                            <p className="text-[15px] text-[#334155] leading-relaxed font-medium italic">"{selectedMessage.complianceAnalysis}"</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <div className="flex items-center gap-3">
                          <Brain size={22} className="text-indigo-600" />
                          <h4 className="text-[19px] font-bold text-[#0F172A]">Persona Mapping</h4>
                        </div>
                        <div className="bg-indigo-50/30 p-7 rounded-xl border border-indigo-100/50">
                          <h5 className="text-[15px] font-bold text-indigo-700 mb-4 uppercase tracking-wider">AI Strategy Thesis:</h5>
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
          <ArrowLeft size={16} /> Exit Creation
        </button>
        <div className="text-sm font-bold text-gray-800">
          Campaign Workspace
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-10">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-6">
            <Sparkles size={14} className="text-[#F97316]" />
            <span className="text-[12px] font-bold text-[#F97316] uppercase tracking-widest">AI Reasoning Active</span>
          </div>
          <h1 className="text-[52px] font-bold text-[#0F172A] mb-3 tracking-tighter leading-none">New BFSI Campaign</h1>
          <p className="text-[21px] text-gray-500 font-medium">Configure your targeted audience and strategic parameters</p>
        </div>

        <div className="space-y-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-12">
            <div className="flex justify-between items-start mb-12">
              <div className="flex items-start gap-6">
                <span className="w-12 h-12 bg-[#FFEDD5] text-[#F97316] rounded-xl flex items-center justify-center text-[24px] font-bold shrink-0">1</span>
                <div>
                  <h2 className="text-[26px] font-bold text-[#0F172A] mb-2">Customer Data (CSV)</h2>
                  <p className="text-[17px] text-gray-500 font-medium max-w-2xl">Upload a CSV to generate unique messages for each profile.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const csvContent = "customer_id,name,occupation,age\nCUST1,John Smith,Software Engineer,32\nCUST2,Alice Wong,Teacher,45";
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'sample_customers.csv';
                  a.click();
                }}
                className="px-6 py-3 border border-gray-200 rounded-xl text-[15px] font-bold text-[#1E293B] hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <Download size={20} /> Download Sample
              </button>
            </div>

            {!uploadedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-24 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/5 transition-all group"
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx" />
                <div className="w-20 h-20 bg-[#FFF7ED] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <UploadIcon size={32} className="text-[#F97316]" />
                </div>
                <p className="text-[20px] font-bold text-gray-400">Click or drag CSV here to begin</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-100 p-8 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Check className="text-green-600" size={32} strokeWidth={3} />
                  <div>
                    <h4 className="text-[18px] font-bold text-[#0F172A]">{uploadedFile.name}</h4>
                    <p className="text-[14px] text-green-700 font-bold uppercase tracking-wider">{uploadedFile.rowCount} Profiles Loaded</p>
                  </div>
                </div>
                <button onClick={() => setUploadedFile(null)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"><X size={24} /></button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
            <div className="flex items-start gap-6 mb-12">
              <span className="w-12 h-12 bg-[#FFEDD5] text-[#F97316] rounded-xl flex items-center justify-center text-[24px] font-bold shrink-0">2</span>
              <h2 className="text-[26px] font-bold text-[#0F172A]">Campaign Parameters</h2>
            </div>
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[17px] font-bold text-[#1E293B] flex items-center gap-2"><MessageSquare size={18} /> Strategic Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Create a credit card offer highlighting the 5% fuel cashback for commuters..."
                  className="w-full h-40 p-6 rounded-xl border border-gray-200 outline-none focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[17px] font-bold text-[#1E293B]">Tone Selection</label>
                <div className="flex gap-4">
                  {['Professional', 'Friendly', 'Urgent'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTone(t)}
                      className={`flex-1 py-4 px-6 rounded-xl border-2 font-bold transition-all ${tone === t ? 'bg-[#F97316] text-white border-[#F97316] shadow-lg shadow-orange-100' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F97316] rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between shadow-xl">
             <div className="text-white">
                <h3 className="text-[26px] font-bold mb-1">Ready to Generate?</h3>
                <p className="text-[17px] opacity-90">AI will process profiles with strategic reasoning hub.</p>
             </div>
             <button 
                onClick={startGeneration}
                disabled={!uploadedFile || !prompt || isGenerating}
                className="mt-6 md:mt-0 px-12 py-4 bg-white text-[#F97316] rounded-xl font-bold text-[18px] hover:scale-105 transition-all shadow-lg disabled:opacity-50"
             >
                <Sparkles size={20} className="inline mr-2" /> Start Generation
             </button>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-[#0F172A]/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center animate-in fade-in">
           <Loader2 className="animate-spin text-[#F97316] mb-8" size={64} />
           <h2 className="text-[48px] font-bold text-white mb-4 tracking-tighter">Strategic Reasoning Engine Active</h2>
           <p className="text-[20px] text-gray-400 max-w-2xl leading-relaxed">
             We are building individual strategy matrices for your customers while ensuring BFSI compliance standards are strictly followed.
           </p>
        </div>
      )}
    </div>
  );
};

export default CreateCampaign;

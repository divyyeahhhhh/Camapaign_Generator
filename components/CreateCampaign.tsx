
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
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startGeneration = async () => {
    const dataToProcess = uploadedFile?.data || [];
    if (dataToProcess.length === 0 || !prompt) return;
    
    setError(null);
    setIsGenerating(true);
    
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("STRATEGIC_KEY_NOT_FOUND: The Strategic Engine requires an API key to be set in the production environment.");
      }

      const ai = new GoogleGenAI({ apiKey });
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

          // Use .text as a property
          const text = response.text;
          if (!text) continue;

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
        } catch (innerError) {
          console.error(`Row ${i+1} Generation Failed:`, innerError);
        }
        
        await new Promise(r => setTimeout(r, 150));
      }
      
      if (results.length > 0) {
        setCurrentStep('results');
      } else {
        throw new Error("ZERO_RESULTS: The engine was unable to synthesize any compliant messages.");
      }

    } catch (err: any) {
      console.error("Critical Strategic Failure:", err);
      setError(err.message || "An unexpected error occurred during generation.");
      alert(err.message || "Strategic Reasoning Engine Failure.");
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
          <div className="text-sm font-bold text-gray-800">Review Logic</div>
        </header>

        <div className="max-w-[1440px] mx-auto px-10">
          <div className="mb-12">
            <h1 className="text-[44px] font-bold text-[#0F172A] mb-2 tracking-tight">Review Generated Campaign</h1>
            <p className="text-[18px] text-gray-500 font-medium">
              {generationResults.length} messages synthesized with {avgScore}% average compliance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {[
              { label: 'Total', value: generationResults.length, color: 'text-[#0F172A]' },
              { label: 'Passed', value: generationResults.filter(r => r.complianceScore >= 90).length, color: 'text-green-600' },
              { label: 'Review', value: generationResults.filter(r => r.complianceScore < 90).length, color: 'text-orange-500' },
              { label: 'Score', value: `${avgScore}%`, color: 'text-[#F97316]' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-[15px] font-medium text-gray-500 mb-4">{stat.label}</p>
                <p className={`text-[44px] font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
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
                    <td className="px-10 py-8 font-bold text-[#0F172A]">{res.customerName}</td>
                    <td className="px-10 py-8 text-[15px] text-gray-600 line-clamp-1">{res.content}</td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${res.complianceScore >= 90 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        {res.complianceScore}%
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button onClick={() => { setSelectedMessage(res); setEditedContent(res.content); setIsEditing(false); }} className="text-[#F97316] font-bold text-sm">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedMessage && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              <div className="px-10 py-7 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-[22px] font-bold text-[#0F172A]">{selectedMessage.customerName} - Analysis</h2>
                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={26} /></button>
              </div>
              <div className="p-10 overflow-y-auto space-y-10">
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[17px] font-bold text-[#0F172A]">Generated Content</h4>
                    <button onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)} className="px-4 py-2 border rounded-xl text-sm font-bold">{isEditing ? 'Save' : 'Edit'}</button>
                  </div>
                  {isEditing ? (
                    <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full h-40 p-6 rounded-xl border" />
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-xl text-[16px] text-gray-600 font-medium">{selectedMessage.content}</div>
                  )}
                </div>
                <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-8">
                  <h4 className="text-[19px] font-bold mb-6 flex items-center gap-2"><Brain size={20} /> Strategic Reasoning</h4>
                  <p className="text-[15px] leading-relaxed text-gray-600">{selectedMessage.strategyLogic}</p>
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
        <div className="text-sm font-bold text-gray-800">Campaign Builder</div>
      </header>

      <div className="max-w-[1440px] mx-auto px-10">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 mb-6">
            <Sparkles size={14} className="text-[#F97316]" />
            <span className="text-[12px] font-bold text-[#F97316] uppercase tracking-widest">Diagnostic Check: Connected</span>
          </div>
          <h1 className="text-[52px] font-bold text-[#0F172A] mb-3 tracking-tighter leading-none">New Compliant Campaign</h1>
          <p className="text-[21px] text-gray-500 font-medium">Power your personalization with the Strategic Reasoning Engine.</p>
        </div>

        <div className="space-y-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
            <div className="flex justify-between items-start mb-12">
              <div className="flex items-start gap-6">
                <span className="w-12 h-12 bg-[#FFEDD5] text-[#F97316] rounded-xl flex items-center justify-center text-[24px] font-bold">1</span>
                <div>
                  <h2 className="text-[26px] font-bold text-[#0F172A] mb-2">Upload Lead Matrix</h2>
                  <p className="text-[17px] text-gray-500 font-medium">Supports CSV and XLSX formats.</p>
                </div>
              </div>
            </div>

            {!uploadedFile ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-24 text-center cursor-pointer hover:bg-orange-50/5 group">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx" />
                <UploadIcon size={32} className="mx-auto text-[#F97316] mb-6" />
                <p className="text-[20px] font-bold text-gray-400">Click to upload lead data</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-100 p-8 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Check className="text-green-600" size={32} />
                  <div>
                    <h4 className="text-[18px] font-bold">{uploadedFile.name}</h4>
                    <p className="text-[14px] text-green-700 font-bold">{uploadedFile.rowCount} Rows Ready</p>
                  </div>
                </div>
                <button onClick={() => setUploadedFile(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
            <div className="flex items-start gap-6 mb-12">
              <span className="w-12 h-12 bg-[#FFEDD5] text-[#F97316] rounded-xl flex items-center justify-center text-[24px] font-bold">2</span>
              <h2 className="text-[26px] font-bold text-[#0F172A]">Campaign Goal</h2>
            </div>
            <div className="space-y-10">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your marketing objective..."
                className="w-full h-40 p-6 rounded-xl border border-gray-200 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
              />
              <div className="flex gap-4">
                {['Professional', 'Friendly', 'Urgent'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setTone(t)}
                    className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${tone === t ? 'bg-[#F97316] text-white border-[#F97316]' : 'bg-white text-gray-500 border-gray-100'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#F97316] rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between shadow-xl">
             <div className="text-white">
                <h3 className="text-[26px] font-bold mb-1">Begin Reasoning Loop?</h3>
                <p className="text-[17px] opacity-90">Engine will synthesize compliant messages.</p>
             </div>
             <button 
                onClick={startGeneration}
                disabled={!uploadedFile || !prompt || isGenerating}
                className="mt-6 md:mt-0 px-12 py-4 bg-white text-[#F97316] rounded-xl font-bold text-[18px] shadow-lg disabled:opacity-50"
             >
                {isGenerating ? 'Synthesizing...' : 'Start Synthesis'}
             </button>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-[#0F172A]/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center">
           <Loader2 className="animate-spin text-[#F97316] mb-8" size={64} />
           <h2 className="text-[48px] font-bold text-white mb-4">Strategic Cycle Active</h2>
           <p className="text-[20px] text-gray-400 max-w-2xl">Ensuring compliant personalization for every profile in your lead matrix.</p>
        </div>
      )}
    </div>
  );
};

export default CreateCampaign;

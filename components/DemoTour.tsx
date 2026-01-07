
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  X, 
  Info, 
  Sparkles, 
  Zap,
  Loader2,
  Mic2,
  User,
  Volume2
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

export enum DemoStep {
  IDLE = 'IDLE',
  INTRO = 'INTRO',
  EXPLAIN_UPLOAD = 'EXPLAIN_UPLOAD',
  AUTO_UPLOAD = 'AUTO_UPLOAD',
  EXPLAIN_PROMPT = 'EXPLAIN_PROMPT',
  AUTO_PROMPT = 'AUTO_PROMPT',
  EXPLAIN_TONE = 'EXPLAIN_TONE',
  START_GEN = 'START_GEN',
  LOADING_EXPLAIN = 'LOADING_EXPLAIN',
  DASHBOARD_EXPLAIN = 'DASHBOARD_EXPLAIN',
  MODAL_EXPLAIN = 'MODAL_EXPLAIN',
  FINISH = 'FINISH'
}

interface DemoTourProps {
  currentStep: DemoStep;
  setDemoStep: (step: DemoStep) => void;
  onClose: () => void;
  isDemoActive: boolean;
}

export const DemoTour: React.FC<DemoTourProps> = ({ currentStep, setDemoStep, onClose, isDemoActive }) => {
  const [loadingVoice, setLoadingVoice] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentVoiceRef = useRef<AudioBufferSourceNode | null>(null);

  const scripts: Record<DemoStep, string> = {
    [DemoStep.IDLE]: "",
    [DemoStep.INTRO]: "Hi! I'm Betty! I'll show you how to build powerful marketing campaigns fast. Let's go!",
    [DemoStep.EXPLAIN_UPLOAD]: "First, let's get our audience ready. I'm loading our sample-customers csv data for you right now.",
    [DemoStep.AUTO_UPLOAD]: "Perfect! Our customer details are loaded and ready for personalization. We support up to ten rows instantly.",
    [DemoStep.EXPLAIN_PROMPT]: "Next, we tell the AI what to do. I'll type in our campaign goal: generate a personalized credit card offer for each customer.",
    [DemoStep.AUTO_PROMPT]: "Goal set! Now we select a tone—let's go with Professional for that expert feel.",
    [DemoStep.EXPLAIN_TONE]: "Everything looks great. Notice how I've set the tone to professional to match our brand.",
    [DemoStep.START_GEN]: "Now, watch the magic happen as I click Start Campaign!",
    [DemoStep.LOADING_EXPLAIN]: "The AI is working hard! It's analyzing each customer's data and ensuring every message meets strict BFSI compliance standards.",
    [DemoStep.DASHBOARD_EXPLAIN]: "We're done! Look at these high compliance scores. I'll open one so you can see the result.",
    [DemoStep.MODAL_EXPLAIN]: "See that? A perfectly tailored message. And look—you can even edit the content right here if you need to make tweaks!",
    [DemoStep.FINISH]: "And that's it! Fast, compliant, and personal. I'm Betty, and I've just automated your marketing workflow. I'm ready when you are!"
  };

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const playVoiceover = async (text: string) => {
    if (currentVoiceRef.current) {
      try { currentVoiceRef.current.stop(); } catch(e) {}
    }
    
    setLoadingVoice(true);
    let lastError = null;
    let retryDelay = 2000;

    for (let i = 0; i < 3; i++) {
      try {
        const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: `You are Betty, a very energetic, fast-talking, and professional AI marketing assistant. Speak this text quickly and enthusiastically: ${text}` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          const ctx = audioContextRef.current;
          const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx);
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          
          return new Promise<void>((resolve) => {
            source.onended = () => resolve();
            source.start();
            currentVoiceRef.current = source;
            setLoadingVoice(false);
          });
        }
        break; // Success or no audio data
      } catch (error: any) {
        lastError = error;
        if (error.message?.includes('429') && i < 2) {
          console.warn(`Betty's voice hit rate limit, retrying in ${retryDelay}ms...`);
          await sleep(retryDelay);
          retryDelay *= 2;
          continue;
        }
        console.error("Betty's voice failed after retries", error);
        break;
      }
    }
    setLoadingVoice(false);
  };

  const runStep = async (step: DemoStep) => {
    if (!isDemoActive || step === DemoStep.IDLE) return;
    
    await playVoiceover(scripts[step]);

    const nextStepMap: Partial<Record<DemoStep, DemoStep>> = {
      [DemoStep.INTRO]: DemoStep.EXPLAIN_UPLOAD,
      [DemoStep.EXPLAIN_UPLOAD]: DemoStep.AUTO_UPLOAD,
      [DemoStep.AUTO_UPLOAD]: DemoStep.EXPLAIN_PROMPT,
      [DemoStep.EXPLAIN_PROMPT]: DemoStep.AUTO_PROMPT,
      [DemoStep.AUTO_PROMPT]: DemoStep.EXPLAIN_TONE,
      [DemoStep.EXPLAIN_TONE]: DemoStep.START_GEN,
      [DemoStep.START_GEN]: DemoStep.LOADING_EXPLAIN,
      [DemoStep.LOADING_EXPLAIN]: DemoStep.DASHBOARD_EXPLAIN,
      [DemoStep.DASHBOARD_EXPLAIN]: DemoStep.MODAL_EXPLAIN,
      [DemoStep.MODAL_EXPLAIN]: DemoStep.FINISH,
      [DemoStep.FINISH]: DemoStep.IDLE
    };

    const next = nextStepMap[step];
    if (next) {
      const delay = step === DemoStep.LOADING_EXPLAIN ? 100 : 500;
      setTimeout(() => {
        setDemoStep(next);
        if (next === DemoStep.IDLE) {
          onClose();
        }
      }, delay);
    }
  };

  useEffect(() => {
    if (isDemoActive) {
      runStep(currentStep);
    }
  }, [currentStep, isDemoActive]);

  if (!isDemoActive) return null;

  if (currentStep === DemoStep.INTRO) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden relative animate-in zoom-in-95 duration-300">
          <button onClick={onClose} className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 transition-colors z-10">
            <X size={20} />
          </button>
          <div className="p-10 pt-12">
            <div className="mb-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white shadow-xl mx-auto mb-6 border-4 border-white">
                <User size={40} />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">I'm Betty!</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">Ready to see me transform your marketing? I'll handle everything!</p>
            </div>
            <button 
              onClick={() => setDemoStep(DemoStep.INTRO)} 
              disabled={loadingVoice}
              className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-orange-600 to-red-500 text-white font-bold text-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl"
            >
              {loadingVoice ? <Loader2 className="animate-spin" size={24} /> : 'Start Demo'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      <div className="max-w-[280px] bg-white rounded-2xl rounded-br-none shadow-2xl border border-orange-100 p-4 animate-in slide-in-from-bottom-2 duration-300 pointer-events-auto relative">
        <p className="text-sm font-semibold text-gray-800 leading-tight">
          {scripts[currentStep]}
        </p>
        <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r border-b border-orange-100 rotate-45"></div>
      </div>

      <div className="relative pointer-events-auto">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-orange-500 to-red-500 shadow-xl flex items-center justify-center text-white border-2 border-white transition-all duration-300 ${loadingVoice ? 'scale-110 shadow-orange-200' : ''}`}>
          <User size={32} />
        </div>
        
        {loadingVoice && (
          <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-25"></div>
        )}
        
        <button 
          onClick={onClose} 
          className="absolute -top-1 -left-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors border border-gray-100"
        >
          <X size={12} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

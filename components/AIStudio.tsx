
import React, { useState } from 'react';
import { generateMarketingContent } from '../services/gemini';
import { AIContentResult } from '../types';

const AIStudio: React.FC = () => {
  const [channel, setChannel] = useState<'Email' | 'Social' | 'Ad Copy'>('Email');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIContentResult | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const data = await generateMarketingContent({ channel, prompt, tone });
      setResult(data);
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Failed to generate content. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">AI Content Studio</h2>
        <p className="text-gray-500">Create high-converting marketing copy in seconds using Gemini Pro.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Channel</label>
            <div className="flex gap-2">
              {['Email', 'Social', 'Ad Copy'].map((c) => (
                <button
                  key={c}
                  onClick={() => setChannel(c as any)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    channel === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">What are we promoting?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A new eco-friendly water bottle launch offering 20% discount for early adopters..."
              className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option>Professional</option>
              <option>Friendly & Casual</option>
              <option>Urgent & Bold</option>
              <option>Luxury & Minimal</option>
              <option>Witty & Humorous</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
              loading || !prompt ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
            }`}
          >
            {loading ? 'Thinking...' : '✨ Generate Content'}
          </button>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-8 min-h-[400px]">
          {result ? (
            <div className="w-full space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              {result.subject && (
                <div>
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    {channel === 'Email' ? 'Subject Line' : 'Headline'}
                  </h4>
                  <p className="text-lg font-bold text-gray-900">{result.subject}</p>
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Body Content</h4>
                <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {result.content}
                </div>
              </div>
              {result.hashtags && result.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {result.hashtags.map((tag) => (
                    <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-medium">
                      #{tag.replace('#', '')}
                    </span>
                  ))}
                </div>
              )}
              <button 
                onClick={() => navigator.clipboard.writeText(result.content)}
                className="w-full mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 py-2 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <p className="text-gray-500 font-medium">Your generated content will appear here.</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Fill in the details and click generate to see the magic happen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIStudio;

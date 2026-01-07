
import React, { useState } from 'react';
import { MOCK_LEADS } from '../constants';
import { analyzeLeadStrategy } from '../services/gemini';

const LeadsCRM: React.FC = () => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<{ [key: string]: string }>({});

  const handleAnalyze = async (lead: typeof MOCK_LEADS[0]) => {
    setAnalyzingId(lead.id);
    try {
      const leadData = `${lead.name}, Email: ${lead.email}, Score: ${lead.score}, Source: ${lead.source}, Status: ${lead.status}`;
      const result = await analyzeLeadStrategy(leadData);
      setStrategy(prev => ({ ...prev, [lead.id]: result }));
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Leads Management</h2>
          <p className="text-gray-500">Track and score your potential customers.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">Export CSV</button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">+ Add Lead</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">AI Insights</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_LEADS.map((lead) => (
              <React.Fragment key={lead.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                        <p className="text-xs text-gray-500">{lead.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${lead.score > 80 ? 'bg-green-500' : lead.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${lead.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      lead.status === 'Hot' ? 'bg-red-100 text-red-700' : 
                      lead.status === 'Warm' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{lead.source}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleAnalyze(lead)}
                      disabled={analyzingId === lead.id}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                    >
                      {analyzingId === lead.id ? 'Analyzing...' : strategy[lead.id] ? 'Refresh Insight' : 'Get AI Strategy'}
                    </button>
                  </td>
                </tr>
                {strategy[lead.id] && (
                  <tr className="bg-indigo-50/30">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="flex gap-2">
                        <span className="text-sm">✨</span>
                        <p className="text-sm italic text-gray-700">
                          <span className="font-bold not-italic">AI Strategy: </span> 
                          {strategy[lead.id]}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsCRM;

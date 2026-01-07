
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { id: AppView.CAMPAIGNS, label: 'Campaigns', icon: '🚀' },
    { id: AppView.AI_STUDIO, label: 'AI Studio', icon: '✨' },
    { id: AppView.LEADS, label: 'Leads CRM', icon: '👥' },
    { id: AppView.ANALYTICS, label: 'Analytics', icon: '📈' },
    { id: AppView.SETTINGS, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Nexus</h1>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
            JD
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Marketing Lead</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

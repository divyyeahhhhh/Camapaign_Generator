
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  User, 
  Shield, 
  MoreHorizontal, 
  Plus, 
  Trash2,
  Laptop
} from 'lucide-react';

interface AccountModalProps {
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[640px] rounded-2xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Sidebar */}
        <div className="w-72 bg-[#F9FAFB] border-r border-gray-100 flex flex-col pt-12">
          <div className="px-10 mb-8">
            <h1 className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">Account</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Manage your account info.</p>
          </div>

          <nav className="px-4 space-y-1">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl text-base font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <User size={20} />
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl text-base font-bold transition-all ${activeTab === 'security' ? 'bg-[#F1F5F9] text-[#0F172A] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Shield size={20} />
              Security
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-12 h-full overflow-y-auto">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-3xl font-extrabold text-[#0F172A]">
                {activeTab === 'profile' ? 'Profile details' : 'Security'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={28} /></button>
            </div>
            
            <div className="h-px bg-gray-100 -mx-12 mb-10"></div>

            {activeTab === 'security' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-400">
                {/* Password Row */}
                <div className="flex items-center justify-between group">
                  <div className="w-48">
                    <p className="text-base font-bold text-gray-900">Password</p>
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <p className="text-2xl font-black tracking-[0.2em] text-gray-900 mt-1">••••••••••</p>
                    <button className="text-sm font-bold text-gray-500 hover:text-[#0F172A] transition-colors underline underline-offset-4">Update password</button>
                  </div>
                </div>

                <div className="h-px bg-gray-100"></div>

                {/* Active Devices */}
                <div className="flex items-start gap-12">
                   <p className="text-base font-bold text-gray-900 w-48 pt-2">Active devices</p>
                   <div className="flex-1 space-y-8">
                     <div className="flex items-start gap-6">
                        <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center text-white shrink-0">
                           <Laptop size={28} />
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <span className="text-lg font-bold text-[#0F172A]">Windows</span>
                              <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[10px] font-black text-gray-500 border border-gray-200 uppercase">This device</span>
                           </div>
                           <p className="text-[15px] text-gray-500 font-medium">Chrome 143.0.0.0</p>
                           <p className="text-[15px] text-gray-500 font-medium">180.235.121.66 (Chennai, IN)</p>
                           <p className="text-[15px] text-gray-500 font-medium">Today at 4:12 PM</p>
                        </div>
                     </div>
                   </div>
                </div>

                <div className="h-px bg-gray-100"></div>

                {/* Delete Account */}
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-gray-900 w-48">Delete account</p>
                  <button className="text-base font-bold text-[#EF4444] hover:underline">Delete account</button>
                </div>
              </div>
            )}
            
            {activeTab === 'profile' && (
              <div className="text-center py-20">
                <p className="text-gray-400 font-medium">Profile settings restored to high fidelity view.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;

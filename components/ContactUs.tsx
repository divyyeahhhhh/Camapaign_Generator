
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Mail, 
  Clock, 
  MessageCircle, 
  Zap, 
  Building2 
} from 'lucide-react';
import BrandLogo from './BrandLogo';

interface ContactUsProps {
  onBack: () => void;
}

const ContactUs: React.FC<ContactUsProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent successfully! Our team will get back to you shortly.");
    onBack();
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="px-10 py-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-6 cursor-pointer h-full" onClick={onBack}>
          <BrandLogo className="scale-90 origin-left" />
          <div className="h-6 w-[1.5px] bg-gray-200 hidden sm:block"></div>
          <span className="font-bold text-[16px] tracking-tight text-[#1E293B] hidden sm:block mt-0.5 whitespace-nowrap">
            Customer Support
          </span>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-[#F97316] hover:text-[#EA580C] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </header>

      <main className="max-w-[1440px] mx-auto px-10">
        {/* Title Section */}
        <div className="text-center mt-12 mb-16">
          <h1 className="text-[56px] font-extrabold text-[#0F172A] mb-4 leading-tight tracking-tight">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Have questions about our BFSI Campaign Generator? We're here to help you create compliant, personalized marketing campaigns.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
          {/* Form Section */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-10">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Send us a Message</h2>
            <p className="text-gray-500 mb-10 font-medium">Fill out the form below and we'll get back to you within 24 hours</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-2.5">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 bg-white"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-2.5">Email Address <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    placeholder="john@company.com"
                    required
                    className="w-full px-4 py-3.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 bg-white"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-2.5">Company</label>
                  <input 
                    type="text" 
                    placeholder="Your Company"
                    className="w-full px-4 py-3.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 bg-white"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-2.5">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 bg-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2.5">Subject <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 bg-white appearance-none cursor-pointer"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    <option>General Inquiry</option>
                    <option>Product Demo Request</option>
                    <option>Technical Support</option>
                    <option>Enterprise Pricing</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2.5">Message <span className="text-red-500">*</span></label>
                <textarea 
                  placeholder="Tell us about your requirements..."
                  required
                  rows={5}
                  className="w-full px-4 py-3.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 resize-none bg-white"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-orange-primary text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 hover:bg-[#EA580C] transition-all shadow-md shadow-orange-100"
              >
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
              <div className="flex items-center gap-3 mb-6">
                <Mail size={22} className="text-[#F97316]" />
                <h3 className="text-xl font-bold text-[#0F172A]">Email Us</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3 font-medium">For general inquiries and sales:</p>
              <a href="mailto:divya.s@newgendigital.com" className="text-lg font-bold text-[#F97316] hover:text-[#EA580C] transition-colors">
                divya.s@newgendigital.com
              </a>
            </div>

            <div className="bg-[#FFEDD5] rounded-xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
              <div className="flex items-center gap-3 mb-6">
                <Clock size={22} className="text-[#F97316]" />
                <h3 className="text-xl font-bold text-[#0F172A]">Response Time</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                We typically respond to all inquiries within <span className="font-bold">24 - 48 hours</span> during business days. For urgent matters, please call us directly.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Help Grid */}
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-extrabold text-[#0F172A]">How Can We Help You?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
          {[
            { 
              title: "Product Demo", 
              icon: <MessageCircle size={24} className="text-[#F97316]" />, 
              desc: "Schedule a personalized demo to see how our platform can transform your BFSI marketing campaigns.",
              bg: "bg-[#FFF7ED]"
            },
            { 
              title: "Technical Support", 
              icon: <Zap size={24} className="text-[#9333EA]" />, 
              desc: "Get help with integration, troubleshooting, or maximizing the platform's features for your use case.",
              bg: "bg-[#F5F3FF]"
            },
            { 
              title: "Enterprise Solutions", 
              icon: <Building2 size={24} className="text-[#16A34A]" />, 
              desc: "Discuss custom integrations, on-premise deployment, and enterprise-grade features for your organization.",
              bg: "bg-[#F0FDF4]"
            }
          ].map((item, i) => (
            <div key={i} className="bg-white p-10 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300">
              <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mb-8`}>
                {item.icon}
              </div>
              <h4 className="text-[22px] font-bold text-[#0F172A] mb-4">{item.title}</h4>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ContactUs;

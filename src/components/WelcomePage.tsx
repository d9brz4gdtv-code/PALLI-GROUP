import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, ArrowRight, LogOut } from 'lucide-react';

interface WelcomePageProps {
  onContinue: () => void;
  onLogout: () => void;
}

export default function WelcomePage({ onContinue, onLogout }: WelcomePageProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#E5E0D5] flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden"
    >
      {/* Decorative Leaf Placeholder (Right side) - Hidden on mobile */}
      <div className="hidden lg:block absolute right-0 top-0 h-full w-1/2 opacity-40 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop" 
          alt="Decorative Leaf" 
          className="h-full w-full object-cover mix-blend-multiply"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        <div className="space-y-6 lg:space-y-8">
          {/* Logo Section */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 lg:gap-4 mb-2 lg:mb-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[#3B55A4] rounded-xl lg:rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-2xl lg:text-4xl font-bold">P</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-[#2D3E66] tracking-tight">Palli group</h1>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 text-[#333] leading-relaxed text-sm lg:text-lg max-w-xl">
            <p>
              Md Forhad Hossain serves as the Chairman of Palli Group, a prominent organization 
              known for its contributions to various sectors. Under his leadership, Palli Group has 
              made significant strides in areas such as agriculture, infrastructure, and community 
              development.
            </p>
            <p className="hidden sm:block">
              His vision has been instrumental in driving innovation and fostering 
              partnerships that enhance the group's impact both locally and internationally.
            </p>
          </div>

          {/* Profile Section */}
          <div className="flex items-start gap-6 pt-4 lg:pt-8">
            <div className="space-y-3 lg:space-y-4">
              <h2 className="text-2xl lg:text-3xl font-black text-[#111] uppercase tracking-tight">TALK TO US</h2>
              <div className="space-y-1 text-[#333]">
                <p className="font-bold text-lg lg:text-xl">Md. Forhad Hossain</p>
                <p className="flex items-center gap-2 text-xs lg:text-sm">
                  <Phone size={14} className="text-[#FF6B00]" />
                  Mobile: 01711-267318
                </p>
                <p className="flex items-center gap-2 text-xs lg:text-sm">
                  <Mail size={14} className="text-[#FF6B00]" />
                  forhad8300@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-6 lg:pt-8">
            <button 
              onClick={onContinue}
              className="flex-1 sm:flex-none bg-[#3B55A4] text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#2D4280] transition-all shadow-xl shadow-[#3B55A4]/20 group"
            >
              Go to Dashboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onLogout}
              className="p-3 lg:p-4 text-gray-500 hover:text-red-500 hover:bg-white/50 rounded-xl lg:rounded-2xl transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

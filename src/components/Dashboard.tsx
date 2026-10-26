import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  Users,
  UserCheck,
  LayoutDashboard,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Megaphone,
  MapPin,
  Trophy,
  ArrowLeft,
  UserPlus,
  MessageCircle,
  ExternalLink,
  Globe
} from 'lucide-react';
import { User, Supervisor } from '../types';
import { storage } from '../lib/storage';
import SupervisorManagement from './SupervisorManagement';
import DsoManagement from './DsoManagement';
import Overview from './Overview';
import ManagerManagement from './ManagerManagement';
import AccountantManagement from './AccountantManagement';
import AdminManagement from './AdminManagement';
import NoticeManagement from './NoticeManagement';
import LiveTracking from './LiveTracking';
import LocationTracker from './LocationTracker';
import DsoPerformanceManagement from './DsoPerformanceManagement';
import SmartSearch from './SmartSearch';
import { firestoreService } from '../lib/firestoreService';
import { Notice } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'managers' | 'accountants' | 'admins' | 'supervisors' | 'dsos' | 'notices' | 'tracking' | 'performance' | 'search'>('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeNotices, setActiveNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const unsubscribe = firestoreService.subscribeNotices((allNotices) => {
      setActiveNotices(allNotices.filter(n => n.active));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans flex flex-col lg:flex-row">
      <LocationTracker user={user} />
      
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#3B55A4] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#3B55A4]/20">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="text-xl font-black text-[#3B55A4] tracking-tighter">PALLI HAT</h1>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'OVERVIEW', icon: LayoutDashboard },
              { id: 'search', label: 'SMART SEARCH', icon: Globe },
              { id: 'tracking', label: 'LIVE TRACKING', icon: MapPin },
              { id: 'performance', label: 'PERFORMANCE', icon: Trophy },
              { id: 'admins', label: 'ADMIN LIST', icon: ShieldCheck },
              { id: 'managers', label: 'MANAGER LIST', icon: Users },
              { id: 'accountants', label: 'ACCOUNTANT LIST', icon: GraduationCap },
              { id: 'supervisors', label: 'SUPERVISOR LIST', icon: UserCheck },
              { id: 'dsos', label: 'DSO LIST', icon: UserPlus },
              { id: 'notices', label: 'NOTICES', icon: Megaphone },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs tracking-widest transition-all duration-300",
                  activeTab === item.id 
                    ? "bg-[#3B55A4] text-white shadow-xl shadow-[#3B55A4]/20 scale-[1.02]" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-[#3B55A4]"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs tracking-widest text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} />
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 pb-24 lg:pb-8">
          {/* Live Notice Bar */}
          <AnimatePresence>
            {activeNotices.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-orange-600 text-white py-3 px-6 rounded-2xl shadow-lg shadow-orange-600/20 flex items-center gap-4">
                  <div className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Live Notice
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="whitespace-nowrap animate-marquee inline-block font-bold text-sm">
                      {activeNotices.map((n, i) => (
                        <span key={n.id} className="mx-8">
                          {n.content}
                          {i < activeNotices.length - 1 && <span className="mx-8 opacity-50">•</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            <div className="flex flex-col">
              <div className="flex items-center justify-between lg:justify-start gap-3 mb-2">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  {activeTab !== 'overview' && (
                    <button 
                      onClick={() => setActiveTab('overview')}
                      className="lg:hidden p-2 bg-white text-[#3B55A4] rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-all mr-1"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  )}
                  <div className="w-10 h-10 bg-[#3B55A4] rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white text-xl font-bold">P</span>
                  </div>
                  <h1 className="text-2xl font-bold text-[#2D3E66] tracking-tight">Palli Hat</h1>
                </div>
                
                {/* Mobile Logout Button */}
                <button 
                  onClick={onLogout}
                  className="lg:hidden p-2 bg-red-50 text-red-500 rounded-xl shadow-sm border border-red-100 active:scale-95 transition-all"
                >
                  <LogOut size={18} />
                </button>
              </div>
              <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase leading-none ml-13">A BRANCH OF PALLI GROUP</p>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <p className="text-[10px] text-gray-500 font-medium">Welcome, {user.email.split('@')[0]}</p>
                <div className="hidden sm:block w-px h-3 bg-gray-300"></div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-[#3B55A4]">
                  <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">{formatDate(currentTime)}</span>
                  <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 tabular-nums">{formatTime(currentTime)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a 
                href={window.location.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 bg-white text-[#3B55A4] px-4 py-2 rounded-xl font-bold text-[10px] tracking-widest shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"
              >
                <ExternalLink size={14} />
                OPEN IN BROWSER
              </a>
            </div>
          </header>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <Overview onNavigate={setActiveTab} />}
            {activeTab === 'managers' && <ManagerManagement />}
            {activeTab === 'accountants' && <AccountantManagement />}
            {activeTab === 'admins' && <AdminManagement />}
            {activeTab === 'supervisors' && <SupervisorManagement />}
            {activeTab === 'dsos' && <DsoManagement />}
            { activeTab === 'notices' && <NoticeManagement /> }
            { activeTab === 'tracking' && <LiveTracking /> }
            { activeTab === 'performance' && <DsoPerformanceManagement /> }
            { activeTab === 'search' && <SmartSearch /> }
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-3 flex items-center justify-around z-50">
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Home' },
          { id: 'search', icon: Globe, label: 'Search' },
          { id: 'tracking', icon: MapPin, label: 'Live' },
          { id: 'supervisors', icon: Users, label: 'Sup' },
          { id: 'performance', icon: Trophy, label: 'Rank' },
          { id: 'notices', icon: Megaphone, label: 'Alert' },
          { id: 'dsos', icon: UserPlus, label: 'DSO' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all flex-1",
              activeTab === item.id ? "text-[#3B55A4] scale-110" : "text-gray-400"
            )}
          >
            <item.icon size={18} />
            <span className="text-[7px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/8801764753051" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-[60] w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#25D366]/40 hover:scale-110 transition-all active:scale-95 group"
        title="Contact on WhatsApp"
      >
        <MessageCircle size={30} fill="currentColor" className="text-white" />
        <span className="absolute right-full mr-4 bg-white text-[#25D366] px-4 py-2 rounded-xl font-bold text-xs shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-gray-100">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}

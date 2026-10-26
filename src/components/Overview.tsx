import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  MapPin,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Megaphone,
  Trophy,
  Star,
  Globe
} from 'lucide-react';
import { Supervisor, DSO, Manager, Accountant, Admin, Notice, User } from '../types';
import { firestoreService } from '../lib/firestoreService';

interface OverviewProps {
  onNavigate?: (tab: any) => void;
}

export default function Overview({ onNavigate }: OverviewProps) {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [dsos, setDsos] = useState<DSO[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [latestNotice, setLatestNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const unsubSupervisors = firestoreService.subscribeSupervisors(setSupervisors);
    const unsubDsos = firestoreService.subscribeDSOs(setDsos);
    const unsubManagers = firestoreService.subscribeManagers(setManagers);
    const unsubAccountants = firestoreService.subscribeAccountants(setAccountants);
    const unsubAdmins = firestoreService.subscribeAdmins(setAdmins);
    const unsubUsers = firestoreService.subscribeUsers(setUsers);
    const unsubNotices = firestoreService.subscribeNotices((notices) => {
      const active = notices.filter(n => n.active);
      if (active.length > 0) {
        setLatestNotice(active[0]);
      } else {
        setLatestNotice(null);
      }
    });

    return () => {
      unsubSupervisors();
      unsubDsos();
      unsubManagers();
      unsubAccountants();
      unsubAdmins();
      unsubUsers();
      unsubNotices();
    };
  }, []);

  const stats = [
    {
      id: 'managers',
      label: 'Managers',
      value: managers.length,
      icon: Briefcase,
      color: 'bg-purple-600',
      shadow: 'shadow-purple-600/20'
    },
    {
      id: 'accountants',
      label: 'Accountants',
      value: accountants.length,
      icon: GraduationCap,
      color: 'bg-emerald-600',
      shadow: 'shadow-emerald-600/20'
    },
    {
      id: 'admins',
      label: 'Admins',
      value: admins.length,
      icon: ShieldCheck,
      color: 'bg-red-600',
      shadow: 'shadow-red-600/20'
    },
    {
      id: 'supervisors',
      label: 'Supervisors',
      value: supervisors.length,
      icon: Users,
      color: 'bg-[#3B55A4]',
      shadow: 'shadow-[#3B55A4]/20'
    },
    {
      id: 'dsos',
      label: 'DSOs',
      value: dsos.length,
      icon: ShieldCheck,
      color: 'bg-[#FF6B00]',
      shadow: 'shadow-[#FF6B00]/20'
    },
    {
      id: 'search',
      label: 'Smart Search',
      value: 'Web',
      icon: Globe,
      color: 'bg-blue-600',
      shadow: 'shadow-blue-600/20'
    },
    {
      id: 'tracking',
      label: 'Active Users',
      value: users.filter(u => u.location).length,
      icon: MapPin,
      color: 'bg-indigo-600',
      shadow: 'shadow-indigo-600/20'
    }
  ];

  interface SupervisorStat extends Supervisor {
    dsoCount: number;
    assignedDSOs: DSO[];
  }

  const [selectedSupervisor, setSelectedSupervisor] = useState<SupervisorStat | null>(null);

  // Calculate DSOs per Supervisor
  const supervisorStats: SupervisorStat[] = supervisors.map(s => {
    const assignedDSOs = dsos.filter(d => d.supervisorId === s.id || d.supervisorName === s.name);
    return { ...s, dsoCount: assignedDSOs.length, assignedDSOs };
  });

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onNavigate?.(stat.id)}
            className="bg-white rounded-[24px] p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 sm:gap-4 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all active:scale-95"
          >
            <div className={`${stat.color} ${stat.shadow} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <stat.icon size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-800">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Notice */}
        <AnimatePresence>
          {latestNotice && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="lg:col-span-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-[40px] p-8 shadow-xl shadow-orange-600/20 text-white relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shrink-0">
                  <Megaphone size={32} className="animate-bounce" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-3 py-1 rounded-full">
                      Latest Notice
                    </span>
                    <span className="text-[10px] text-white/60 font-bold">
                      {new Date(latestNotice.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-2xl font-bold leading-tight">
                    {latestNotice.content}
                  </h4>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-3xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Supervisor Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-[#3B55A4]" size={24} />
              Supervisor Distribution
            </h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">DSOs Assigned</span>
          </div>

          <div className="space-y-4">
            {supervisorStats.length === 0 ? (
              <p className="text-center py-10 text-gray-400 italic">No Supervisors added yet.</p>
            ) : (
              supervisorStats.map((s, index) => (
                <motion.div 
                  key={s.id} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSupervisor(s)}
                  className="flex items-center gap-4 p-4 bg-[#F0F2F5] rounded-2xl cursor-pointer hover:bg-gray-200 transition-all overflow-hidden"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#3B55A4] font-bold shadow-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm">{s.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.designation}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm shrink-0">
                    <span className="text-[#FF6B00] font-black text-lg">{s.dsoCount}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* DSO List Modal */}
        <AnimatePresence>
          {selectedSupervisor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl"
              >
                <div className="p-8 bg-[#3B55A4] text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-2xl font-bold truncate">{selectedSupervisor.name}</h3>
                      <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1 truncate">
                        {selectedSupervisor.designation}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedSupervisor(null)}
                      className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all shrink-0 ml-4"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl w-fit">
                    <ShieldCheck size={16} className="text-[#FF6B00]" />
                    <span className="text-sm font-bold">
                      {selectedSupervisor.dsoCount} DSOs Assigned
                    </span>
                  </div>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-3">
                    {selectedSupervisor.assignedDSOs.length > 0 ? (
                      selectedSupervisor.assignedDSOs.map((dso: DSO) => (
                        <div key={dso.id} className="flex items-center gap-4 p-4 bg-[#F0F2F5] rounded-2xl group hover:bg-[#3B55A4]/5 transition-all overflow-hidden">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#3B55A4] shadow-sm overflow-hidden shrink-0">
                            {dso.photoUrl ? (
                              <img 
                                src={dso.photoUrl} 
                                alt={dso.name} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dso.name)}&background=3B55A4&color=fff`;
                                }}
                              />
                            ) : (
                              <UserCheck size={24} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800">{dso.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{dso.area}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Performance</p>
                            <div className="flex items-center justify-end gap-1 text-[#FF6B00]">
                              <Star size={12} fill="currentColor" />
                              <span className="font-black">{dso.performance || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-400 italic">No DSOs assigned to this supervisor yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setSelectedSupervisor(null)}
                    className="w-full py-4 bg-[#3B55A4] text-white rounded-2xl font-bold shadow-lg shadow-[#3B55A4]/20 hover:bg-[#2d417d] transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Top DSO Performers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#3B55A4] rounded-[40px] p-8 shadow-xl shadow-[#3B55A4]/20 text-white overflow-hidden relative"
        >
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Trophy size={24} className="text-yellow-400" />
              Top DSO Performers
            </h3>
            
            <div className="space-y-6">
              {dsos
                .filter(d => d.performance !== undefined)
                .sort((a, b) => (b.performance || 0) - (a.performance || 0))
                .slice(0, 3)
                .map((d, index) => (
                  <div key={d.id} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex items-center gap-4 group hover:bg-white/20 transition-all">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg ${
                      index === 0 ? 'bg-yellow-500 text-white shadow-yellow-500/20' :
                      index === 1 ? 'bg-gray-300 text-gray-800 shadow-gray-300/20' :
                      'bg-orange-600 text-white shadow-orange-600/20'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{d.name}</h4>
                      <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{d.area}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-yellow-400 mb-1">
                        <Star size={14} fill="currentColor" />
                        <span className="font-black text-xl">{d.performance || 0}</span>
                      </div>
                      <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Points</p>
                    </div>
                  </div>
                ))}
              
              {dsos.filter(d => d.performance !== undefined).length === 0 && (
                <div className="py-10 text-center text-white/40 italic">
                  No performance data available yet.
                </div>
              )}
            </div>

            <div className="mt-8 p-6 bg-white/10 rounded-3xl border border-white/10">
              <p className="font-bold text-xs flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-400" />
                Performance rankings are updated live by Admins.
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </div>
  );
}

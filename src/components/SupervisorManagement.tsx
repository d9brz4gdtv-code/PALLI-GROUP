import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  UserPlus, 
  Phone, 
  Briefcase, 
  Calendar,
  X,
  Camera,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { Supervisor, DSO } from '../types';
import { firestoreService } from '../lib/firestoreService';
import { format } from 'date-fns';
import { SEED_SUPERVISORS } from '../constants/supervisorData';
import { SEED_DSOS } from '../constants/dsoData';
import PhotoUploadModal, { compressImageFile } from './PhotoUploadModal';

export default function SupervisorManagement() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [dsos, setDsos] = useState<DSO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [photoModalTarget, setPhotoModalTarget] = useState<Supervisor | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [joinDate, setJoinDate] = useState('');

  useEffect(() => {
    const unsubSupervisors = firestoreService.subscribeSupervisors(setSupervisors);
    const unsubDsos = firestoreService.subscribeDSOs(setDsos);
    return () => {
      unsubSupervisors();
      unsubDsos();
    };
  }, []);

  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleUpdatePhoto = async (newPhotoUrl: string) => {
    if (!photoModalTarget) return;
    await firestoreService.updateSupervisorPhoto(photoModalTarget.id, newPhotoUrl);
    setStatusMessage({ 
      text: `${photoModalTarget.name}-এর ছবি সফলভাবে আপডেট হয়েছে!`, 
      type: "success" 
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleResetToOfficial = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আগের সব সুপারভাইজার ও DSO মুছে নতুন ৪ জন সুপারভাইজার এবং ৩০ জন DSO তালিকা লোড করতে চান?")) {
      return;
    }
    setIsSyncing(true);
    try {
      await firestoreService.resetToOfficialSupervisorsAndDSOs(SEED_SUPERVISORS, SEED_DSOS);
      setStatusMessage({ text: "আগের তালিকা সফলভাবে মুছে নতুন ৪ জন সুপারভাইজার ও ৩০ জন DSO লোড করা হয়েছে!", type: "success" });
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: "ডাটা আপডেট করতে সমস্যা হয়েছে।", type: "error" });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleAddSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinDate) return;
    const newMember: Supervisor = {
      id: crypto.randomUUID(),
      name,
      phone,
      designation,
      photoUrl: photoUrl || `https://picsum.photos/seed/${name}/200/200`,
      joinDate,
    };

    await firestoreService.addSupervisor(newMember);
    
    // Reset form
    setName('');
    setPhone('');
    setDesignation('');
    setPhotoUrl('');
    setJoinDate('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await firestoreService.deleteSupervisor(id);
  };

  const filteredSupervisors = supervisors.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-xl font-bold text-sm tracking-wide ${
              statusMessage.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {statusMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search supervisors by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 shadow-sm focus:ring-2 focus:ring-[#3B55A4] outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleResetToOfficial}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-[#3B55A4] hover:border-blue-200 px-5 py-4 rounded-2xl font-bold text-xs tracking-wider shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            title="পূর্বের তালিকা মুছে নতুন ৪ জন সুপারভাইজার ও ৩০ জন DSO লোড করুন"
          >
            <RotateCcw size={16} className={isSyncing ? "animate-spin text-[#3B55A4]" : "text-gray-500"} />
            {isSyncing ? 'আপডেট হচ্ছে...' : 'নতুন তালিকা লোড (৪ সুপারভাইজার)'}
          </button>

          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 bg-[#3B55A4] text-white px-8 py-4 rounded-2xl font-bold text-sm tracking-widest hover:bg-[#2D4280] shadow-lg shadow-[#3B55A4]/20 transition-all active:scale-[0.98]"
          >
            <UserPlus size={18} />
            ADD SUPERVISOR
          </button>
        </div>
      </div>

      {/* Supervisor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredSupervisors.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="bg-white/50 inline-flex p-6 rounded-full mb-4">
                <Search size={40} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">No supervisors found.</p>
            </div>
          ) : (
            filteredSupervisors.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-[#3B55A4]/5 transition-all relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div 
                    onClick={() => setPhotoModalTarget(member)}
                    className="relative group/avatar cursor-pointer"
                    title="ছবি পরিবর্তন করতে ক্লিক করুন"
                  >
                    <img 
                      src={member.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3B55A4&color=fff`} 
                      alt={member.name}
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-[#F0F2F5] transition-all group-hover/avatar:brightness-90 shadow-sm"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3B55A4&color=fff`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                      <Camera size={18} />
                      <span className="text-[8px] font-bold mt-0.5 tracking-tight">ছবি বদলান</span>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoModalTarget(member);
                      }}
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#3B55A4] hover:bg-[#2D4280] text-white border-2 border-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-90"
                      title="ছবি পরিবর্তন বা আপলোড করুন"
                    >
                      <Camera size={13} />
                    </button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-800">{member.name}</h3>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <p className="text-[#3B55A4] font-bold text-xs uppercase tracking-wider">{member.designation}</p>
                      <button 
                        type="button"
                        onClick={() => setPhotoModalTarget(member)}
                        className="text-[10px] text-[#3B55A4] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <Camera size={10} />
                        ছবি পরিবর্তন
                      </button>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Phone size={12} />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Calendar size={12} />
                        <span>Joined {format(new Date(member.joinDate), 'MMM yyyy')}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Assigned DSOs</p>
                        <div className="flex flex-wrap gap-1.5">
                          {dsos.filter(d => d.supervisorId === member.id || d.supervisorName === member.name).length > 0 ? (
                            dsos.filter(d => d.supervisorId === member.id || d.supervisorName === member.name).map(d => (
                              <span key={d.id} className="px-2 py-0.5 bg-[#F0F2F5] text-[#3B55A4] text-[9px] font-bold rounded-md">
                                {d.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-gray-300 italic">No DSOs assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(member.id)}
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Supervisor Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#3B55A4]">New Supervisor</h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddSupervisor} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative">
                      <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#3B55A4] focus:ring-2 focus:ring-[#3B55A4] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="tel" 
                        placeholder="+880 1XXX XXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#3B55A4] focus:ring-2 focus:ring-[#3B55A4] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Designation</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="e.g. Manager"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#3B55A4] focus:ring-2 focus:ring-[#3B55A4] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Join Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="date" 
                          value={joinDate}
                          onChange={(e) => setJoinDate(e.target.value)}
                          className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#3B55A4] focus:ring-2 focus:ring-[#3B55A4] outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        <div 
                          onClick={() => document.getElementById('photo-upload')?.click()}
                          className="w-16 h-16 bg-[#F0F2F5] rounded-2xl flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-200 transition-all overflow-hidden border-2 border-dashed border-gray-300"
                        >
                          {photoUrl ? (
                            <img src={photoUrl} className="w-full h-full object-cover" alt="Preview" />
                          ) : (
                            <Camera size={24} />
                          )}
                        </div>
                        <div className="flex-1">
                          <input 
                            id="photo-upload"
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressImageFile(file, 350, 350, 0.85);
                                  setPhotoUrl(compressed);
                                } catch (err) {
                                  console.error(err);
                                }
                              }
                            }}
                            className="hidden" 
                          />
                          <button 
                            type="button"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                            className="text-[10px] font-black text-[#3B55A4] uppercase tracking-widest hover:underline"
                          >
                            {photoUrl ? 'Change Photo' : 'Upload Photo'}
                          </button>
                          <p className="text-[9px] text-gray-400 mt-1">PNG, JPG, Camera</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#3B55A4] text-white py-5 rounded-2xl font-bold text-sm tracking-widest hover:bg-[#2D4280] shadow-xl shadow-[#3B55A4]/20 transition-all active:scale-[0.98] mt-4"
                >
                  SAVE SUPERVISOR
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Photo Change / Upload Modal */}
      <AnimatePresence>
        {photoModalTarget && (
          <PhotoUploadModal
            isOpen={!!photoModalTarget}
            onClose={() => setPhotoModalTarget(null)}
            title="সুপারভাইজার ছবি পরিবর্তন"
            name={photoModalTarget.name}
            currentPhotoUrl={photoModalTarget.photoUrl}
            onSave={handleUpdatePhoto}
            themeColor="blue"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

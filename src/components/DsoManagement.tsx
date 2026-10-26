import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  UserPlus, 
  Phone, 
  MapPin, 
  Calendar,
  X,
  UserCheck,
  Camera,
  RotateCcw
} from 'lucide-react';
import { DSO, Supervisor } from '../types';
import { firestoreService } from '../lib/firestoreService';
import { format } from 'date-fns';
import { SEED_DSOS } from '../constants/dsoData';
import { SEED_SUPERVISORS } from '../constants/supervisorData';
import PhotoUploadModal, { compressImageFile } from './PhotoUploadModal';

export default function DsoManagement() {
  const [dsos, setDsos] = useState<DSO[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [photoModalTarget, setPhotoModalTarget] = useState<DSO | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [dob, setDob] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [supervisorId, setSupervisorId] = useState('');

  useEffect(() => {
    const unsubDsos = firestoreService.subscribeDSOs(setDsos);
    const unsubSups = firestoreService.subscribeSupervisors(setSupervisors);
    return () => {
      unsubDsos();
      unsubSups();
    };
  }, []);

  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleUpdatePhoto = async (newPhotoUrl: string) => {
    if (!photoModalTarget) return;
    await firestoreService.updateDSOPhoto(photoModalTarget.id, newPhotoUrl);
    setStatusMessage({ 
      text: `${photoModalTarget.name}-এর ছবি সফলভাবে আপডেট হয়েছে!`, 
      type: "success" 
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleResetToOfficial = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আগের সব সুপারভাইজার ও DSO মুছে নতুন ৩০ জন DSO এবং ৪ জন সুপারভাইজার তালিকা লোড করতে চান?")) {
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

  const handleAddDSO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinDate) return;
    
    const selectedSup = supervisors.find(s => s.id === supervisorId);

    const newDSO: DSO = {
      id: crypto.randomUUID(),
      name,
      phone,
      area,
      joinDate,
      dob,
      photoUrl: photoUrl || `https://picsum.photos/seed/${name}/200/200`,
      performance: 0,
      supervisorId: selectedSup?.id,
      supervisorName: selectedSup?.name
    };

    await firestoreService.addDSO(newDSO);
    
    // Reset form
    setName('');
    setPhone('');
    setArea('');
    setJoinDate('');
    setDob('');
    setPhotoUrl('');
    setSupervisorId('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await firestoreService.deleteDSO(id);
  };

  const filteredDsos = dsos.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.area.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Search DSOs by name or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 shadow-sm focus:ring-2 focus:ring-[#FF6B00] outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleResetToOfficial}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:text-[#FF6B00] hover:border-orange-200 px-5 py-4 rounded-2xl font-bold text-xs tracking-wider shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            title="পূর্বের তালিকা মুছে নতুন ৩০ জন DSO ও ৪ জন সুপারভাইজার লোড করুন"
          >
            <RotateCcw size={16} className={isSyncing ? "animate-spin text-[#FF6B00]" : "text-gray-500"} />
            {isSyncing ? 'আপডেট হচ্ছে...' : 'নতুন তালিকা লোড (৩০ DSO)'}
          </button>

          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 bg-[#FF6B00] text-white px-8 py-4 rounded-2xl font-bold text-sm tracking-widest hover:bg-[#E66000] shadow-lg shadow-[#FF6B00]/20 transition-all active:scale-[0.98]"
          >
            <UserPlus size={18} />
            ADD DSO
          </button>
        </div>
      </div>

      {/* DSO Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredDsos.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="bg-white/50 inline-flex p-6 rounded-full mb-4">
                <Search size={40} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">No DSOs found.</p>
            </div>
          ) : (
            filteredDsos.map((dso) => (
              <motion.div
                key={dso.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-[#FF6B00]/5 transition-all relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div 
                    onClick={() => setPhotoModalTarget(dso)}
                    className="relative group/avatar cursor-pointer w-16 h-16 bg-[#FFF4ED] rounded-2xl overflow-hidden flex items-center justify-center text-[#FF6B00] shadow-sm flex-shrink-0"
                    title="ছবি পরিবর্তন করতে ক্লিক করুন"
                  >
                    {dso.photoUrl ? (
                      <img 
                        src={dso.photoUrl} 
                        className="w-full h-full object-cover transition-all group-hover/avatar:brightness-90" 
                        alt={dso.name} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dso.name)}&background=FF6B00&color=fff`;
                        }}
                      />
                    ) : (
                      <UserCheck size={32} />
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                      <Camera size={16} />
                      <span className="text-[7px] font-bold mt-0.5 tracking-tight">ছবি বদলান</span>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoModalTarget(dso);
                      }}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FF6B00] hover:bg-[#E66000] text-white border-2 border-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-90"
                      title="ছবি পরিবর্তন বা আপলোড করুন"
                    >
                      <Camera size={11} />
                    </button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-800">{dso.name}</h3>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <p className="text-[#FF6B00] font-bold text-xs uppercase tracking-wider">{dso.area}</p>
                      <button 
                        type="button"
                        onClick={() => setPhotoModalTarget(dso)}
                        className="text-[9px] text-[#FF6B00] bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-md font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <Camera size={10} />
                        ছবি পরিবর্তন
                      </button>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Phone size={12} />
                        <span>{dso.phone}</span>
                      </div>
                      {dso.dob && (
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Calendar size={12} />
                          <span>DOB: {format(new Date(dso.dob), 'dd MMM yyyy')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Calendar size={12} />
                        <span>Joined {format(new Date(dso.joinDate), 'dd MMM yyyy')}</span>
                      </div>
                      {dso.supervisorName && (
                        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-2 text-[#3B55A4] text-[10px] font-bold">
                          <UserCheck size={12} />
                          <span>Sup: {dso.supervisorName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(dso.id)}
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add DSO Modal */}
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
                <h2 className="text-2xl font-bold text-[#FF6B00]">New DSO</h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddDSO} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative">
                      <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="e.g. Rahim Ahmed"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00] outline-none transition-all"
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
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Area / Region</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="e.g. Dhaka North"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Assign Supervisor</label>
                    <div className="relative">
                      <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select 
                        value={supervisorId}
                        onChange={(e) => setSupervisorId(e.target.value)}
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00] outline-none appearance-none transition-all"
                      >
                        <option value="">No Supervisor</option>
                        {supervisors.map(sup => (
                          <option key={sup.id} value={sup.id}>{sup.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div 
                        onClick={() => document.getElementById('dso-photo-upload')?.click()}
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
                          id="dso-photo-upload"
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
                          onClick={() => document.getElementById('dso-photo-upload')?.click()}
                          className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest hover:underline"
                        >
                          {photoUrl ? 'Change Photo' : 'Upload Photo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="date" 
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Join Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="date" 
                        value={joinDate}
                        onChange={(e) => setJoinDate(e.target.value)}
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#FF6B00] text-white py-5 rounded-2xl font-bold text-sm tracking-widest hover:bg-[#E66000] shadow-xl shadow-[#FF6B00]/20 transition-all active:scale-[0.98] mt-4"
                >
                  SAVE DSO
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
            title="DSO ছবি পরিবর্তন"
            name={photoModalTarget.name}
            currentPhotoUrl={photoModalTarget.photoUrl}
            onSave={handleUpdatePhoto}
            themeColor="orange"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

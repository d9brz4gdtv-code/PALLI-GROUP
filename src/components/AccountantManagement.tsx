import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  User, 
  Phone, 
  Mail,
  GraduationCap,
  Calendar,
  X,
  Camera
} from 'lucide-react';
import { Accountant } from '../types';
import { firestoreService } from '../lib/firestoreService';
import { format } from 'date-fns';

export default function AccountantManagement() {
  const [accountants, setAccountants] = useState<Accountant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [qualification, setQualification] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    return firestoreService.subscribeAccountants(setAccountants);
  }, []);

  const handleAddAccountant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinDate) return;
    const newAccountant: Accountant = {
      id: crypto.randomUUID(),
      name,
      phone,
      email,
      qualification,
      joinDate,
      photoUrl: photoUrl || `https://picsum.photos/seed/${name}/200/200`
    };
    
    await firestoreService.addAccountant(newAccountant);
    
    setName('');
    setPhone('');
    setEmail('');
    setQualification('');
    setJoinDate('');
    setPhotoUrl('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await firestoreService.deleteAccountant(id);
  };

  const filteredAccountants = accountants.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.qualification.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search accountants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm"
          />
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} />
          ADD ACCOUNTANT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAccountants.map((accountant) => (
            <motion.div
              key={accountant.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 relative group"
            >
              <button 
                onClick={() => handleDelete(accountant.id)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 overflow-hidden">
                  {accountant.photoUrl ? (
                    <img 
                      src={accountant.photoUrl} 
                      className="w-full h-full object-cover" 
                      alt={accountant.name} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(accountant.name)}&background=059669&color=fff`;
                      }}
                    />
                  ) : (
                    <User size={28} />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-gray-800 text-lg leading-tight">{accountant.name}</h3>
                  <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">{accountant.qualification}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-500">
                  <Phone size={16} className="text-gray-300" />
                  <span className="text-sm font-bold">{accountant.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Mail size={16} className="text-gray-300" />
                  <span className="text-sm font-bold">{accountant.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Calendar size={16} className="text-gray-300" />
                  <span className="text-xs font-bold uppercase tracking-wider">Joined: {format(new Date(accountant.joinDate), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">NEW ACCOUNTANT</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddAccountant} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahim Ahmed"
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="accountant@pallihat.com"
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Qualification</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="e.g. CA, MBA (Finance)"
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div 
                        onClick={() => document.getElementById('accountant-photo-upload')?.click()}
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
                          id="accountant-photo-upload"
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPhotoUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                        <button 
                          type="button"
                          onClick={() => document.getElementById('accountant-photo-upload')?.click()}
                          className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                        >
                          {photoUrl ? 'Change Photo' : 'Upload Photo'}
                        </button>
                      </div>
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
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                >
                  SAVE ACCOUNTANT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

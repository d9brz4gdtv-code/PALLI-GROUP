import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  User, 
  Phone, 
  Mail,
  Briefcase,
  Calendar,
  X,
  Camera
} from 'lucide-react';
import { Manager } from '../types';
import { firestoreService } from '../lib/firestoreService';
import { format } from 'date-fns';

export default function ManagerManagement() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    return firestoreService.subscribeManagers(setManagers);
  }, []);

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinDate) return;
    const newManager: Manager = {
      id: crypto.randomUUID(),
      name,
      phone,
      email,
      department,
      joinDate,
      photoUrl: photoUrl || `https://picsum.photos/seed/${name}/200/200`
    };
    
    await firestoreService.addManager(newManager);
    
    setName('');
    setPhone('');
    setEmail('');
    setDepartment('');
    setJoinDate('');
    setPhotoUrl('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await firestoreService.deleteManager(id);
  };

  const filteredManagers = managers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search managers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-sm"
          />
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} />
          ADD MANAGER
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredManagers.map((manager) => (
            <motion.div
              key={manager.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 relative group"
            >
              <button 
                onClick={() => handleDelete(manager.id)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 overflow-hidden">
                  {manager.photoUrl ? (
                    <img 
                      src={manager.photoUrl} 
                      className="w-full h-full object-cover" 
                      alt={manager.name} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(manager.name)}&background=9333ea&color=fff`;
                      }}
                    />
                  ) : (
                    <User size={28} />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-gray-800 text-lg leading-tight">{manager.name}</h3>
                  <p className="text-purple-600 text-[10px] font-black uppercase tracking-widest">{manager.department}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-500">
                  <Phone size={16} className="text-gray-300" />
                  <span className="text-sm font-bold">{manager.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Mail size={16} className="text-gray-300" />
                  <span className="text-sm font-bold">{manager.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Calendar size={16} className="text-gray-300" />
                  <span className="text-xs font-bold uppercase tracking-wider">Joined: {format(new Date(manager.joinDate), 'MMM dd, yyyy')}</span>
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
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">NEW MANAGER</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddManager} className="space-y-6">
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
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
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
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
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
                        placeholder="manager@pallihat.com"
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Department</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Operations"
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div 
                        onClick={() => document.getElementById('manager-photo-upload')?.click()}
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
                          id="manager-photo-upload"
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
                          onClick={() => document.getElementById('manager-photo-upload')?.click()}
                          className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline"
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
                        className="w-full bg-[#F0F2F5] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                >
                  SAVE MANAGER
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, TrendingUp, Save, User as UserIcon, Search, X } from 'lucide-react';
import { DSO } from '../types';
import { firestoreService } from '../lib/firestoreService';

export default function DsoPerformanceManagement() {
  const [dsos, setDsos] = useState<DSO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [performanceValue, setPerformanceValue] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = firestoreService.subscribeDSOs(setDsos);
    return () => unsubscribe();
  }, []);

  const handleSave = async (id: string) => {
    setIsSaving(true);
    try {
      await firestoreService.updateDSOPerformance(id, performanceValue);
      setEditingId(null);
    } catch (error) {
      console.error('Error updating performance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDsos = dsos.filter(dso => 
    dso.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dso.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
            <Trophy size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">DSO Performance</h2>
            <p className="text-sm text-gray-500">Manage performance scores for Top 1, 2, 3 rankings</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search DSO by name or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all text-sm"
          />
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-50">
                <th className="pb-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest pl-4">DSO</th>
                <th className="pb-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">Supervisor</th>
                <th className="pb-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">Area</th>
                <th className="pb-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest">Current Score</th>
                <th className="pb-4 font-bold text-[10px] text-gray-400 uppercase tracking-widest text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDsos.map((dso) => (
                <tr key={dso.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 overflow-hidden">
                        {dso.photoUrl ? (
                          <img 
                            src={dso.photoUrl} 
                            alt={dso.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dso.name)}&background=eab308&color=fff`;
                            }}
                          />
                        ) : (
                          <UserIcon size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{dso.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{dso.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-xs font-bold text-[#3B55A4] bg-blue-50 px-2 py-1 rounded-lg whitespace-nowrap">
                      {dso.supervisorName || 'Unassigned'}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg whitespace-nowrap">
                      {dso.area}
                    </span>
                  </td>
                  <td className="py-4">
                    {editingId === dso.id ? (
                      <input
                        type="number"
                        value={performanceValue}
                        onChange={(e) => setPerformanceValue(Number(e.target.value))}
                        className="w-24 px-3 py-1.5 bg-white border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-500 text-sm font-bold"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-gray-800">{dso.performance || 0}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 text-right pr-4">
                    {editingId === dso.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(dso.id)}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 bg-yellow-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-yellow-500/20 hover:bg-yellow-600 transition-all disabled:opacity-50"
                        >
                          <Save size={14} />
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(dso.id);
                          setPerformanceValue(dso.performance || 0);
                        }}
                        className="text-xs font-bold text-yellow-600 hover:text-yellow-700 bg-yellow-50 px-4 py-1.5 rounded-xl transition-all"
                      >
                        Edit Score
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden space-y-4">
          {filteredDsos.map((dso) => (
            <div key={dso.id} className="bg-gray-50 rounded-2xl p-4 space-y-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 overflow-hidden shadow-sm">
                    {dso.photoUrl ? (
                      <img 
                        src={dso.photoUrl} 
                        alt={dso.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dso.name)}&background=eab308&color=fff`;
                        }}
                      />
                    ) : (
                      <UserIcon size={24} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{dso.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{dso.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-black text-gray-800">{dso.performance || 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Supervisor</p>
                  <p className="text-xs font-bold text-[#3B55A4]">
                    {dso.supervisorName || 'Unassigned'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Area</p>
                  <p className="text-xs font-bold text-gray-600">
                    {dso.area}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                {editingId === dso.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={performanceValue}
                      onChange={(e) => setPerformanceValue(Number(e.target.value))}
                      className="flex-1 px-4 py-3 bg-white border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-500 text-sm font-bold"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(dso.id)}
                      disabled={isSaving}
                      className="bg-yellow-500 text-white p-3 rounded-xl shadow-lg shadow-yellow-500/20"
                    >
                      <Save size={20} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-200 text-gray-600 p-3 rounded-xl"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(dso.id);
                      setPerformanceValue(dso.performance || 0);
                    }}
                    className="w-full py-3 bg-yellow-50 text-yellow-600 rounded-xl font-bold text-sm hover:bg-yellow-100 transition-all"
                  >
                    Edit Performance Score
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

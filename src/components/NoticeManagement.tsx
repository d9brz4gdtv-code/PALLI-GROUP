import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Megaphone, Bell, CheckCircle2, XCircle } from 'lucide-react';
import { Notice } from '../types';
import { firestoreService } from '../lib/firestoreService';

export default function NoticeManagement() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotice, setNewNotice] = useState({ content: '' });

  useEffect(() => {
    const unsubscribe = firestoreService.subscribeNotices(setNotices);
    return () => unsubscribe();
  }, []);

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.content.trim()) return;

    const notice: Notice = {
      id: Date.now().toString(),
      content: newNotice.content,
      createdAt: new Date().toISOString(),
      active: true
    };

    await firestoreService.addNotice(notice);
    setNewNotice({ content: '' });
    setShowAddModal(false);
  };

  const toggleNoticeStatus = async (notice: Notice) => {
    await firestoreService.addNotice({ ...notice, active: !notice.active });
  };

  const handleDeleteNotice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      await firestoreService.deleteNotice(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
            <Megaphone size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Notice Management</h2>
            <p className="text-sm text-gray-500">Post important updates for everyone</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
        >
          <Plus size={20} />
          Add New Notice
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {notices.map((notice) => (
            <motion.div
              key={notice.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-6 rounded-2xl border transition-all ${
                notice.active 
                  ? 'bg-white border-orange-100 shadow-sm' 
                  : 'bg-gray-50 border-gray-200 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notice.active ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Bell size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-lg font-medium leading-relaxed ${notice.active ? 'text-gray-800' : 'text-gray-500'}`}>
                      {notice.content}
                    </p>
                    <p className="text-xs text-gray-400">
                      Posted on: {new Date(notice.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleNoticeStatus(notice)}
                    className={`p-2 rounded-lg transition-colors ${
                      notice.active 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-200'
                    }`}
                    title={notice.active ? 'Deactivate' : 'Activate'}
                  >
                    {notice.active ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  </button>
                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {notices.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Megaphone size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No notices posted yet</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg relative z-10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Create New Notice</h3>
              <form onSubmit={handleAddNotice} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Notice Message</label>
                  <textarea
                    required
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ content: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all min-h-[150px] resize-none"
                    placeholder="Type your important message here..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
                  >
                    Post Notice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

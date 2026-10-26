import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, ExternalLink, Clock, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { firestoreService } from '../lib/firestoreService';

export default function LiveTracking() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsubscribe = firestoreService.subscribeUsers(setUsers);
    return () => unsubscribe();
  }, []);

  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const activeUsers = users.filter(u => u.location);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <MapPin size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Live User Tracking</h2>
            <p className="text-sm text-gray-500">Monitor real-time locations of active users</p>
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            {activeUsers.length} Users Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {activeUsers.map((user) => (
            <motion.div
              key={user.uid}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 overflow-hidden">
                    {user.photoUrl ? (
                      <img 
                        src={user.photoUrl} 
                        alt={user.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=2563eb&color=fff`;
                        }}
                      />
                    ) : (
                      <UserIcon size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{user.name || user.email.split('@')[0]}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <Clock size={10} />
                  {user.location ? getTimeAgo(user.location.lastUpdated) : 'N/A'}
                </div>
              </div>

              {user.location && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                      <Navigation size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Coordinates</p>
                      <p className="text-xs font-mono text-gray-600 truncate">
                        {user.location.lat.toFixed(6)}, {user.location.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  <a
                    href={getGoogleMapsUrl(user.location.lat, user.location.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 group-hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ExternalLink size={18} />
                    View on Google Maps
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {activeUsers.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Navigation size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Users</h3>
            <p className="text-gray-500 max-w-xs">
              When users open the app and grant location permission, they will appear here in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import WelcomePage from './components/WelcomePage';
import { auth, db } from './lib/firebase';
import { firestoreService } from './lib/firestoreService';
import { storage } from './lib/storage';
import { User } from './types';
import { SEED_SUPERVISORS } from './constants/supervisorData';
import { SEED_DSOS } from './constants/dsoData';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        let userData: User;
        
        if (userDoc.exists()) {
          userData = userDoc.data() as User;
        } else {
          const role = firebaseUser.email === 'pollihat.nagad@gmail.com' ? 'admin' : 'user';
          userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            role: role,
            photoUrl: firebaseUser.photoURL || ''
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        }
        
        setUser(userData);

        // Migrate data if admin
        if (userData.role === 'admin') {
          const migrationKey = 'palli_synced_30_dsos_v3';
          if (localStorage.getItem(migrationKey) !== 'true') {
            try {
              await firestoreService.resetToOfficialSupervisorsAndDSOs(SEED_SUPERVISORS, SEED_DSOS);
              localStorage.setItem(migrationKey, 'true');
            } catch (migErr) {
              console.error('Migration error:', migErr);
            }
          }

          const supervisors = storage.getSupervisors();
          const dsos = storage.getDSOs();
          const managers = storage.getManagers();
          const accountants = storage.getAccountants();
          const admins = storage.getAdmins();

          if (supervisors.length > 0) {
            for (const s of supervisors) await firestoreService.addSupervisor(s);
            storage.saveSupervisors([]);
          }
          if (dsos.length > 0) {
            for (const d of dsos) await firestoreService.addDSO(d);
            storage.saveDSOs([]);
          }
          if (managers.length > 0) {
            for (const m of managers) await firestoreService.addManager(m);
            storage.saveManagers([]);
          }
          if (accountants.length > 0) {
            for (const a of accountants) await firestoreService.addAccountant(a);
            storage.saveAccountants([]);
          }
          if (admins.length > 0) {
            for (const a of admins) await firestoreService.addAdmin(a);
            storage.saveAdmins([]);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setShowWelcome(true);
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setShowWelcome(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B55A4]"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <main className="min-h-screen">
      {showWelcome ? (
        <WelcomePage 
          onContinue={() => setShowWelcome(false)} 
          onLogout={handleLogout} 
        />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </main>
  );
}

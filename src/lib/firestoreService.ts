import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocs,
  writeBatch,
  Unsubscribe,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Supervisor, DSO, Manager, Accountant, Admin, Notice, User } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function handleFirestoreListenerError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  console.warn(`Firestore subscription notice (${operationType} on ${path}):`, errMessage);
}

export const firestoreService = {
  // Connection test
  testConnection: async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. ");
      }
    }
  },

  // Notices
  subscribeNotices: (callback: (data: Notice[]) => void): Unsubscribe => {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notice));
      callback(data);
    }, (error) => handleFirestoreListenerError(error, OperationType.LIST, 'notices'));
  },
  addNotice: async (data: Notice) => {
    try {
      await setDoc(doc(db, 'notices', data.id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `notices/${data.id}`);
    }
  },
  deleteNotice: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notices', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notices/${id}`);
    }
  },

  // Users
  updateUserLocation: async (uid: string, location: { lat: number, lng: number, lastUpdated: string }) => {
    try {
      await setDoc(doc(db, 'users', uid), { location }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },
  subscribeUsers: (callback: (data: User[]) => void): Unsubscribe => {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
      callback(data);
    }, (error) => handleFirestoreListenerError(error, OperationType.LIST, 'users'));
  },

  // Supervisors
  subscribeSupervisors: (callback: (data: Supervisor[]) => void): Unsubscribe => {
    const q = query(collection(db, 'supervisors'), orderBy('joinDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Supervisor));
      callback(data);
    }, (error) => handleFirestoreListenerError(error, OperationType.LIST, 'supervisors'));
  },
  addSupervisor: async (data: Supervisor) => {
    try {
      await setDoc(doc(db, 'supervisors', data.id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `supervisors/${data.id}`);
    }
  },
  addSupervisors: async (data: Supervisor[]) => {
    try {
      const promises = data.map(sup => setDoc(doc(db, 'supervisors', sup.id), sup));
      await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'supervisors (bulk)');
    }
  },
  deleteSupervisor: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'supervisors', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `supervisors/${id}`);
    }
  },
  updateSupervisorPhoto: async (id: string, photoUrl: string) => {
    try {
      await setDoc(doc(db, 'supervisors', id), { photoUrl }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `supervisors/${id}`);
    }
  },

  // DSOs
  subscribeDSOs: (callback: (data: DSO[]) => void): Unsubscribe => {
    const q = query(collection(db, 'dsos'), orderBy('joinDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DSO));
      callback(data);
    }, (error) => handleFirestoreListenerError(error, OperationType.LIST, 'dsos'));
  },
  addDSO: async (data: DSO) => {
    try {
      await setDoc(doc(db, 'dsos', data.id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `dsos/${data.id}`);
    }
  },
  addDSOs: async (data: DSO[]) => {
    try {
      const promises = data.map(dso => setDoc(doc(db, 'dsos', dso.id), dso));
      await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'dsos (bulk)');
    }
  },
  deleteDSO: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'dsos', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `dsos/${id}`);
    }
  },
  updateDSOPerformance: async (id: string, performance: number) => {
    try {
      await setDoc(doc(db, 'dsos', id), { performance }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `dsos/${id}`);
    }
  },
  assignSupervisorToDSO: async (dsoId: string, supervisorId: string, supervisorName: string) => {
    try {
      await setDoc(doc(db, 'dsos', dsoId), { supervisorId, supervisorName }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `dsos/${dsoId}`);
    }
  },
  updateDSOArea: async (id: string, area: string) => {
    try {
      await setDoc(doc(db, 'dsos', id), { area }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `dsos/${id}`);
    }
  },
  updateDSOPhoto: async (id: string, photoUrl: string) => {
    try {
      await setDoc(doc(db, 'dsos', id), { photoUrl }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `dsos/${id}`);
    }
  },
  resetToOfficialSupervisorsAndDSOs: async (officialSupervisors: Supervisor[], officialDSOs: DSO[]) => {
    try {
      // 1. Fetch and delete all existing supervisors
      const supSnapshot = await getDocs(collection(db, 'supervisors'));
      for (const d of supSnapshot.docs) {
        await deleteDoc(doc(db, 'supervisors', d.id));
      }

      // 2. Fetch and delete all existing DSOs
      const dsoSnapshot = await getDocs(collection(db, 'dsos'));
      for (const d of dsoSnapshot.docs) {
        await deleteDoc(doc(db, 'dsos', d.id));
      }

      // 3. Add official supervisors
      for (const sup of officialSupervisors) {
        await setDoc(doc(db, 'supervisors', sup.id), sup);
      }

      // 4. Add official DSOs
      for (const dso of officialDSOs) {
        await setDoc(doc(db, 'dsos', dso.id), dso);
      }

      console.log('Successfully wiped old records and added official Supervisors & DSOs');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'supervisors/dsos reset');
    }
  },

  // Managers
  subscribeManagers: (callback: (data: Manager[]) => void): Unsubscribe => {
    const q = query(collection(db, 'managers'), orderBy('joinDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Manager));
      callback(data);
    }, (error) => handleFirestoreListenerError(error, OperationType.LIST, 'managers'));
  },
  addManager: async (data: Manager) => {
    try {
      await setDoc(doc(db, 'managers', data.id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `managers/${data.id}`);
    }
  },
  deleteManager: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'managers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `managers/${id}`);
    }
  },

  // Accountants
  subscribeAccountants: (callback: (data: Accountant[]) => void): Unsubscribe => {
    const q = query(collection(db, 'accountants'), orderBy('joinDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Accountant));
      callback(data);
    }, (error) => handleFirestoreListenerError(error, OperationType.LIST, 'accountants'));
  },
  addAccountant: async (data: Accountant) => {
    try {
      await setDoc(doc(db, 'accountants', data.id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `accountants/${data.id}`);
    }
  },
  deleteAccountant: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'accountants', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `accountants/${id}`);
    }
  },

  // Admins
  subscribeAdmins: (callback: (data: Admin[]) => void): Unsubscribe => {
    const q = query(collection(db, 'admins'), orderBy('joinDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Admin));
      callback(data);
    }, (error) => handleFirestoreListenerError(error, OperationType.LIST, 'admins'));
  },
  addAdmin: async (data: Admin) => {
    try {
      await setDoc(doc(db, 'admins', data.id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `admins/${data.id}`);
    }
  },
  deleteAdmin: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'admins', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admins/${id}`);
    }
  },
};

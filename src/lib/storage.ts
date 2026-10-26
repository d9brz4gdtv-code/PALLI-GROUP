import { User, Supervisor, DSO, Manager, Accountant, Admin } from '../types';

const STORAGE_KEYS = {
  USER: 'palli_user',
  SUPERVISOR: 'palli_supervisor',
  DSO: 'palli_dso',
  MANAGER: 'palli_manager',
  ACCOUNTANT: 'palli_accountant',
  ADMIN: 'palli_admin',
};

export const storage = {
  getSupervisors: (): Supervisor[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SUPERVISOR);
    return data ? JSON.parse(data) : [];
  },
  
  saveSupervisors: (supervisors: Supervisor[]) => {
    localStorage.setItem(STORAGE_KEYS.SUPERVISOR, JSON.stringify(supervisors));
  },
  
  addSupervisor: (member: Supervisor) => {
    const supervisors = storage.getSupervisors();
    storage.saveSupervisors([member, ...supervisors]);
  },
  
  deleteSupervisor: (id: string) => {
    const supervisors = storage.getSupervisors();
    storage.saveSupervisors(supervisors.filter(s => s.id !== id));
  },

  getDSOs: (): DSO[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DSO);
    return data ? JSON.parse(data) : [];
  },

  saveDSOs: (dsos: DSO[]) => {
    localStorage.setItem(STORAGE_KEYS.DSO, JSON.stringify(dsos));
  },

  addDSO: (dso: DSO) => {
    const dsos = storage.getDSOs();
    storage.saveDSOs([dso, ...dsos]);
  },

  deleteDSO: (id: string) => {
    const dsos = storage.getDSOs();
    storage.saveDSOs(dsos.filter(d => d.id !== id));
  },

  getManagers: (): Manager[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MANAGER);
    return data ? JSON.parse(data) : [];
  },

  saveManagers: (managers: Manager[]) => {
    localStorage.setItem(STORAGE_KEYS.MANAGER, JSON.stringify(managers));
  },

  addManager: (manager: Manager) => {
    const managers = storage.getManagers();
    storage.saveManagers([manager, ...managers]);
  },

  deleteManager: (id: string) => {
    const managers = storage.getManagers();
    storage.saveManagers(managers.filter(m => m.id !== id));
  },

  getAccountants: (): Accountant[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTANT);
    return data ? JSON.parse(data) : [];
  },

  saveAccountants: (accountants: Accountant[]) => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTANT, JSON.stringify(accountants));
  },

  addAccountant: (accountant: Accountant) => {
    const accountants = storage.getAccountants();
    storage.saveAccountants([accountant, ...accountants]);
  },

  deleteAccountant: (id: string) => {
    const accountants = storage.getAccountants();
    storage.saveAccountants(accountants.filter(a => a.id !== id));
  },

  getAdmins: (): Admin[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN);
    return data ? JSON.parse(data) : [];
  },

  saveAdmins: (admins: Admin[]) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(admins));
  },

  addAdmin: (admin: Admin) => {
    const admins = storage.getAdmins();
    storage.saveAdmins([admin, ...admins]);
  },

  deleteAdmin: (id: string) => {
    const admins = storage.getAdmins();
    storage.saveAdmins(admins.filter(a => a.id !== id));
  },
  
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  
  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },
};

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  photoUrl?: string;
  location?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
}

export type UserRole = 'admin' | 'user';

export interface DSO {
  id: string;
  name: string;
  phone: string;
  area: string;
  joinDate: string;
  dob?: string;
  photoUrl?: string;
  performance?: number;
  supervisorId?: string;
  supervisorName?: string;
}

export interface Supervisor {
  id: string;
  name: string;
  phone: string;
  designation: string;
  photoUrl?: string;
  joinDate: string;
}

export interface Manager {
  id: string;
  name: string;
  phone: string;
  email: string;
  department: string;
  joinDate: string;
  photoUrl?: string;
}

export interface Accountant {
  id: string;
  name: string;
  phone: string;
  email: string;
  qualification: string;
  joinDate: string;
  photoUrl?: string;
}

export interface Admin {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  joinDate: string;
  photoUrl?: string;
}

export interface Notice {
  id: string;
  content: string;
  createdAt: string;
  active: boolean;
}

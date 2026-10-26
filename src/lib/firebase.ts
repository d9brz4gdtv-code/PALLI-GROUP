import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  photoUrl?: string;
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user profile exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      const role = user.email === 'pollihat.nagad@gmail.com' ? 'admin' : 'user';
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        role: role,
        photoUrl: user.photoURL || undefined
      };
      await setDoc(doc(db, 'users', user.uid), userProfile);
      return userProfile;
    }
    
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string) => {
  try {
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      // Handle both 'user-not-found' and 'invalid-credential' for admin auto-creation
      // 'invalid-credential' is often returned by Identity Platform instead of 'user-not-found'
      const isUserNotFound = err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential';
      
      if (isUserNotFound && email === 'pollihat.nagad@gmail.com') {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        } catch (createErr: any) {
          // If creation fails (e.g. email already exists with different provider), throw original error
          throw err;
        }
      } else {
        throw err;
      }
    }

    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      const role = user.email === 'pollihat.nagad@gmail.com' ? 'admin' : 'user';
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'User',
        role: role
      };
      await setDoc(doc(db, 'users', user.uid), userProfile);
      return userProfile;
    }
    
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Error signing in with Email:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, pass: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
    const role = user.email === 'pollihat.nagad@gmail.com' ? 'admin' : 'user';
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      name: name || user.email?.split('@')[0] || 'User',
      role: role
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile;
  } catch (error) {
    console.error('Error signing up with Email:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);

export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

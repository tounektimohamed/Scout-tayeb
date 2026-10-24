import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserRole, AssignedLeader } from '../types/scout';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailOrRegister: (email: string, pass: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateCurrentProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync profile based on email rules:
  // 1. tounekti17@gmail.com (or codeopen540@gmail.com) => troop_leader
  // 2. assigned_leaders/{email} => section_leader
  // 3. all others => parent
  const syncUserProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const email = (firebaseUser.email || '').toLowerCase().trim();
    const isTroopLeader = email === 'tounekti17@gmail.com' || email === 'codeopen540@gmail.com';

    let determinedRole: UserRole = 'parent';
    let assignedSection: string | undefined = undefined;
    let preferredName = firebaseUser.displayName || '';

    if (isTroopLeader) {
      determinedRole = 'troop_leader';
      preferredName = preferredName || 'القائد العام (قائد الفوج)';
    } else if (email) {
      try {
        // Check if Troop Leader assigned this email to lead a section
        const leaderDoc = await getDoc(doc(db, 'assigned_leaders', email));
        if (leaderDoc.exists() && leaderDoc.data()?.isActive !== false) {
          const leaderData = leaderDoc.data() as AssignedLeader;
          determinedRole = 'section_leader';
          assignedSection = leaderData.sectionId;
          preferredName = leaderData.name || preferredName || 'قائد فرقة';
        }
      } catch (err) {
        console.warn("Could not check assigned_leaders:", err);
      }
    }

    const cleanProfileData = (data: Partial<UserProfile>): Record<string, any> => {
      const sanitized: Record<string, any> = {};
      for (const [key, val] of Object.entries(data)) {
        if (val !== undefined) {
          sanitized[key] = val;
        }
      }
      return sanitized;
    };

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const existingSnap = await getDoc(userDocRef);

    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as UserProfile;
      // If role or section changed by troop leader, update user profile doc
      if (existingData.role !== determinedRole || (assignedSection && existingData.sectionId !== assignedSection)) {
        const updated: UserProfile = {
          ...existingData,
          role: determinedRole,
          sectionId: assignedSection || existingData.sectionId || '',
          name: preferredName || existingData.name
        };
        await setDoc(userDocRef, cleanProfileData(updated), { merge: true });
        return updated;
      }
      return existingData;
    } else {
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        name: preferredName || 'عضو كشفي',
        email: firebaseUser.email || '',
        phone: firebaseUser.phoneNumber || '+216 ',
        role: determinedRole,
        sectionId: assignedSection || '',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, cleanProfileData(newProfile));
      return newProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userProf = await syncUserProfile(firebaseUser);
          setProfile(userProf);
        } catch (err) {
          console.error("Error synchronizing user profile:", err);
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message || 'فشل تسجيل الدخول عبر Google');
      throw err;
    }
  };

  // Unified email login or register
  const signInWithEmailOrRegister = async (email: string, pass: string, name?: string) => {
    setError(null);
    const cleanEmail = email.toLowerCase().trim();
    try {
      // First attempt to sign in
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (err: any) {
      // If user not found, automatically register them!
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          if (name && cred.user) {
            await syncUserProfile(cred.user);
          }
          return;
        } catch (regErr: any) {
          let msg = 'تعذر تسجيل الدخول أو إنشاء الحساب.';
          if (regErr.code === 'auth/weak-password') msg = 'كلمة المرور يجب أن لا تقل عن 6 أحرف.';
          setError(msg);
          throw new Error(msg);
        }
      }
      let arabicMsg = 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.';
      if (err.code === 'auth/wrong-password') arabicMsg = 'كلمة المرور غير صحيحة.';
      setError(arabicMsg);
      throw new Error(arabicMsg);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setProfile(null);
      setUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const updateCurrentProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signInWithGoogle,
        signInWithEmailOrRegister,
        signOut,
        updateCurrentProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

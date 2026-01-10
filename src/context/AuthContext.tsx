'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ------------------------------------------------------------------
// CONFIG: TEACHER WHITELIST
// ------------------------------------------------------------------
const TEACHER_EMAILS = [
    'cuevasr.sebastian@gmail.com',
    'felipefriasj@gmail.com',
    'cesar.toro.g@gmail.com',
    'camilacs.arq@gmail.com'
];

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isTeacher: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isTeacher, setIsTeacher] = useState(false);

    useEffect(() => {
        // Persistent listener via Firebase SDK
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
                // Check Whitelist
                const isAllowedTeacher = TEACHER_EMAILS.includes(currentUser.email || '');
                setIsTeacher(isAllowedTeacher);

                // Sync user to Firestore if new
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const userSnap = await getDoc(userRef);
                    if (!userSnap.exists()) {
                        await setDoc(userRef, {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                            photoURL: currentUser.photoURL,
                            role: isAllowedTeacher ? 'teacher' : 'student',
                            createdAt: new Date().toISOString()
                        });
                    }
                } catch (e) {
                    console.error("Error syncing user profile", e);
                }

            } else {
                setUser(null);
                setIsTeacher(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in with Google', error);
            throw error;
        }
    };

    const logout = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isTeacher, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

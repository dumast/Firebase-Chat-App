import React, { useState, useEffect, createContext, useContext, ReactChildren, ReactChild } from 'react';
import nookies from 'nookies';
import {
    User,
    getAuth,
    onIdTokenChanged,
} from 'firebase/auth';
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebase_app from '@/firebase/config';

import type { _AuthContext, _DbUser } from '@/utils/types';

const auth = getAuth(firebase_app);
const db = getFirestore(firebase_app)

export const AuthContext = createContext<_AuthContext>({ user: null, dbUser: null });

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({
    children,
}: React.PropsWithChildren) => {
    const [loading, setLoading] = useState<boolean>(true);

    const [user, setUser] = useState<User | null>(null);
    const [dbUser, setDbUser] = useState<_DbUser | null>(null);

    useEffect(() => {
        return onIdTokenChanged(auth, async (user: User | null) => {
            setLoading(true);
            if (!user) {
                setUser(null);
                nookies.set(undefined, 'token', '', { path: '/' });
            } else {
                const token = await user.getIdToken();
                setUser(user);
                const dbUserDoc = await getDoc(doc(db, "users", user.uid));
                if (dbUserDoc.exists()) {
                    const dbUserData = dbUserDoc.data();
                    if (dbUserData != null) {
                        setDbUser({
                            displayName: dbUserData.displayName || null,
                            username: dbUserData.username,
                            email: dbUserData.email,
                            friends: dbUserData.friends
                        })
                    }
                }
                nookies.set(undefined, 'token', token, { path: '/' });
            }
            setLoading(false);
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, dbUser }}>
            {loading ? <div>Loading</div> : children}
        </AuthContext.Provider>
    );
};
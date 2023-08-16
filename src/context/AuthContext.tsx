import React, { useState, useEffect, createContext, useContext, ReactChildren, ReactChild } from 'react';
import nookies from 'nookies';
import {
    User,
    getAuth,
    onIdTokenChanged,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore";
import firebase_app from '@/firebase/config';

import type { _AuthContext, _DbUser } from '@/utils/types';

const auth = getAuth(firebase_app);
const db = getFirestore(firebase_app)

export const AuthContext = createContext<_AuthContext>({ user: null, dbUser: null });

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({
    children,
}: React.PropsWithChildren) => {
    const [userLoading, setUserLoading] = useState<boolean>(true);
    const [dbUserLoading, setDbUserLoading] = useState<boolean>(true);


    const [user, setUser] = useState<User | null>(null);
    const [dbUser, setDbUser] = useState<_DbUser | null>(null);

    useEffect(() => {
        return onIdTokenChanged(auth, async (user: User | null) => {
            setUserLoading(true);
            if (!user) {
                setUser(null);
                nookies.set(undefined, 'token', '', { path: '/' });
            } else {
                const token = await user.getIdToken();
                setUser(user);
                nookies.set(undefined, 'token', token, { path: '/' });
            }
            setUserLoading(false);
        });
    }, []);

    useEffect(() => {
        if (user != null) {
            return onSnapshot(doc(db, "users", user.uid), (doc) => {
                setDbUserLoading(true);
                const dbUserData = doc.data();
                if (dbUserData != undefined && dbUserData != null) {
                    setDbUser({
                        displayName: dbUserData.displayName || null,
                        username: dbUserData.username,
                        email: dbUserData.email,
                        friends: dbUserData.friends
                    })
                }
                setDbUserLoading(false);
            })
        }
    }, [user])

    return (
        <AuthContext.Provider value={{ user, dbUser }}>
            {userLoading || dbUserLoading ? <div>Loading</div> : children}
        </AuthContext.Provider>
    );
};
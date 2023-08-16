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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

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
            setDbUserLoading(true);
            if (!user) {
                setUser(null);
                setDbUser(null);
                setDbUserLoading(false);
                nookies.set(undefined, 'token', '', { path: '/' });
            } else {
                const token = await user.getIdToken();
                setUser(user);
                nookies.set(undefined, 'token', token, { path: '/' });
                onSnapshot(doc(db, "users", user.uid), (doc) => {
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
            setUserLoading(false);
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, dbUser }}>
            {userLoading || dbUserLoading ? <div className={"main loader"}><FontAwesomeIcon icon={faCircleNotch} size='2xl' /></div> : children}
        </AuthContext.Provider>
    );
};
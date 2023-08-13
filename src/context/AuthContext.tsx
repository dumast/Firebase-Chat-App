import React, { useState, useEffect, createContext, useContext, ReactChildren, ReactChild } from 'react';
import nookies from 'nookies';
import {
    User,
    getAuth,
    onIdTokenChanged,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, onSnapshot } from "firebase/firestore";
import firebase_app from '@/firebase/config';
import SignIn from "@/app/signin/page";

const auth = getAuth(firebase_app);
const db = getFirestore(firebase_app)


export interface AuthContext {
    user: User | null,
    dbUser: DbUser | null,
}

export interface DbUser {
    displayName: string | null,
    username: string,
    email: string,
    friends?: string[]
}

export const AuthContext = createContext<AuthContext>({ user: null, dbUser: null });

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({
    children,
}: React.PropsWithChildren) => {
    const [loading, setLoading] = useState<boolean>(true);

    const [user, setUser] = useState<User | null>(null);
    const [dbUser, setDbUser] = useState<DbUser | null>(null);

    useEffect(() => {
        return onIdTokenChanged(auth, async (user: User | null) => {
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
                            displayName: dbUserData.displayName ? dbUserData.displayName : null,
                            username: dbUserData.username,
                            email: dbUserData.email
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
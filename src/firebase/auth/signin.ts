import { FirebaseError } from "firebase/app";
import firebase_app from "../config";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";

const auth = getAuth(firebase_app);

export default async function signIn(email: string, password: string) {
    let result = null,
        error: FirebaseError | null = null;
    try {
        result = await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
        const err = e instanceof FirebaseError;
        if (err) {
            error = e;
        };
    }

    return { result, error };
}
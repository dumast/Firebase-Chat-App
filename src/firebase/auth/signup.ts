import firebase_app from "@/firebase/config";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { Config, NumberDictionary } from "unique-names-generator";
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');


const auth = getAuth(firebase_app);
const db = getFirestore(firebase_app)

export default async function signUp(email: string, password: string) {
    let result = null,
        error: FirebaseError
            | null = null;
    try {
        result = await createUserWithEmailAndPassword(auth, email, password);

        const customConfig: Config = {
            dictionaries: [adjectives, colors, animals, NumberDictionary.generate({ min: 1000, max: 9999 })],
            separator: '-',
            length: 4,
        };

        const randomName: string = uniqueNamesGenerator(customConfig);

        await setDoc(doc(db, "users", result.user.uid), {
            username: randomName.toLowerCase(),
            email: email
        }, {
            merge: true,
        });
    } catch (e) {
        const err = e instanceof FirebaseError;
        if (err) {
            error = e;
        };
    }

    return { result, error };
}
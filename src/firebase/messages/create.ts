import { Message } from "@/app/conversations/[slug]/page";
import firebase_app from "../config";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore(firebase_app)

export default async function createMessage(content: string, conversationDocumentId: string, userId: string) {
    const date = new Date().getTime().toString()

    let result = null,
        error = null;
    try {
        const newMessage: Message = {
            type: 'text',
            content: content,
            timestamp: date,
            author: userId
        }

        result = await setDoc(doc(db, `conversations/${conversationDocumentId}/messages`, date), newMessage, {
            merge: true,
        });
    } catch (e) {
        error = e;
    }

    return { result, error };
}
import firebase_app from "../config";
import { getFirestore, doc, setDoc, query, collection, onSnapshot, QueryDocumentSnapshot, DocumentData, orderBy, limit } from "firebase/firestore";

import type { _Message } from "@/utils/types";

const db = getFirestore(firebase_app)

function checkMessageType(message: DocumentData): message is _Message {
    return message.type === 'text' || message.type === 'image';
}

export function getMessages(conversationDocumentId: string, setMessages: React.Dispatch<React.SetStateAction<_Message[]>>) {
    const messagesQuery = query(collection(db, `conversations/${conversationDocumentId}/messages`), orderBy("timestamp", "asc"), limit(100));
    return onSnapshot(messagesQuery, (doc) => {
        let tmpMessages: _Message[] = [];
        if (doc.docs.length == 0) return;
        doc.docs.map((msg: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
            const documentData = msg.data();
            if (checkMessageType(documentData)) {
                tmpMessages.push(documentData);
            }
        })
        setMessages(tmpMessages);
    });
}

export async function createMessage(content: string, conversationDocumentId: string, userId: string) {
    const date = parseInt(new Date().getTime().toString());

    let result = null,
        error = null;
    try {
        const newMessage: _Message = {
            type: 'text',
            content: content,
            timestamp: date,
            author: userId
        }

        result = await setDoc(doc(db, `conversations/${conversationDocumentId}/messages`, date.toString()), newMessage, {
            merge: true,
        });
    } catch (e) {
        error = e;
    }

    return { result, error };
}
'use client'

import { AuthContext, useAuthContext } from "@/context/AuthContext"
import firebase_app from "@/firebase/config"
import createMessage from "@/firebase/messages/create"
import { DocumentData, QueryDocumentSnapshot, Timestamp, collection, doc, getDocs, getFirestore, limit, onSnapshot, query, where } from "firebase/firestore"
import { useState, useEffect, FormEvent, useMemo } from "react"

const db = getFirestore(firebase_app)

export interface Message {
    type: 'text' | 'image',
    content: string,
    author: string,
    timestamp: string,
}

export default function Page({ params }: { params: { slug: string } }) {
    const { user }: AuthContext = useAuthContext();

    const [newMessage, setNewMessage] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([])

    const conversationDocumentId: string = useMemo(() => [params.slug, user!.uid].sort().join("-"), []);

    async function handleForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const { result, error } = await createMessage(newMessage, conversationDocumentId, user!.uid);
        setNewMessage("");
    }

    function checkMessageType(message: DocumentData): message is Message {
        return message.type === 'text' || message.type === 'image';
    }


    useEffect(() => {
        const messagesQuery = query(collection(db, `conversations/${conversationDocumentId}/messages`), limit(100));
        onSnapshot(messagesQuery, (doc) => {
            let tmpMessages: Message[] = [];
            if (doc.docs.length == 0) return;
            doc.docs.map((msg: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
                const documentData = msg.data();
                if (checkMessageType(documentData)) {
                    tmpMessages.push(documentData);
                }
            })
            setMessages(tmpMessages);
        });
    }, [])

    return (
        <div>
            {messages.map((message: Message, index: number) => {
                return (
                    <div key={index}>{message.content}</div>
                )
            })}
            <form onSubmit={handleForm}>
                <label htmlFor="message">
                    <p>Message</p>
                    <input onChange={(e) => setNewMessage(e.target.value)} value={newMessage} />
                </label>
                <button type="submit">Send</button>
            </form>
        </div>
    )
}
'use client';

import { useAuthContext } from "@/context/AuthContext";
import firebase_app from "@/firebase/config";
import { getUserData } from "@/firebase/friends";
import createMessage from "@/firebase/messages/create";
import { DocumentData, QueryDocumentSnapshot, collection, getFirestore, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import React, { useState, useEffect, FormEvent, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from './conversations.module.css'

import type { _Message, _Friend, _AuthContext } from "@/utils/types";

const db = getFirestore(firebase_app)

export default function Page({ params }: { params: { slug: string } }) {
    const router = useRouter();

    const { user, dbUser }: _AuthContext = useAuthContext();

    const [newMessage, setNewMessage] = useState<string>("");
    const [messages, setMessages] = useState<_Message[]>([])
    const [friendData, setFriendData] = useState<_Friend>({ id: "", displayName: "" });

    const conversationDocumentId: string = useMemo(() => [params.slug, user?.uid].sort().join("-"), []);

    async function handleForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const { result, error } = await createMessage(newMessage, conversationDocumentId, user!.uid);
        setNewMessage("");
    }

    function checkMessageType(message: DocumentData): message is _Message {
        return message.type === 'text' || message.type === 'image';
    }


    useEffect(() => {
        if (user === null || dbUser === null || !dbUser?.friends?.includes(params.slug)) return router.push("/");
        async function init() {
            const friend = await getUserData(params.slug);
            if (friend === null) return;
            if (!friend.friends.includes(user!.uid)) return router.push("/")
            setFriendData({ id: friend.id, displayName: friend.displayName || friend.username });
        }
        init();
    }, [user])

    useEffect(() => {
        const messagesQuery = query(collection(db, `conversations/${conversationDocumentId}/messages`), orderBy("timestamp", "asc"), limit(100));
        onSnapshot(messagesQuery, (doc) => {
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
    }, [])

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <div className={styles.container}>
            <div className={styles.chatbox}>
                {messages.map((message: _Message, index: number) => {
                    return (
                        <div key={index}>
                            {message.author === params.slug && <p>{friendData?.displayName}</p>}
                            {message.author === user!.uid && <p>{dbUser?.displayName || dbUser?.username}</p>}
                            <p>{message.content}</p>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>
            <form className={styles.textbar} onSubmit={handleForm}>
                <label htmlFor="message">
                    <p>Message</p>
                    <input className={styles.textbarInput} placeholder={`Message ${friendData.displayName}`} onChange={(e) => setNewMessage(e.target.value)} value={newMessage} />
                </label>
                <button hidden type="submit" disabled={newMessage === ""}>Send</button>
            </form>
        </div>
    )
}
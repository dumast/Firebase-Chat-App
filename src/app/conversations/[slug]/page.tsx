'use client';

import { useAuthContext } from "@/context/AuthContext";
import firebase_app from "@/firebase/config";
import { getUserData } from "@/firebase/friends";
import { createMessage, getMessages } from "@/firebase/messages";
import { DocumentData, QueryDocumentSnapshot, collection, getFirestore, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import React, { useState, useEffect, FormEvent, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from './conversations.module.css'

import type { _Message, _Friend, _AuthContext, _CurrentPageContext } from "@/utils/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useCurrentPageContext } from "@/context/CurrentPageContext";

const db = getFirestore(firebase_app)

export default function Page({ params }: { params: { slug: string } }) {
    const router = useRouter();

    const { user, dbUser }: _AuthContext = useAuthContext();
    const { setTitle }: _CurrentPageContext = useCurrentPageContext();

    const [newMessage, setNewMessage] = useState<string>("");

    const [messages, setMessages] = useState<_Message[]>([])
    const [friendData, setFriendData] = useState<_Friend>({ id: "", displayName: "" });

    const conversationDocumentId: string = useMemo(() => [params.slug, user?.uid].sort().join("-"), []);

    async function handleForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if(newMessage.replaceAll(" ", "")==="") return;
        setNewMessage("");
        const { result, error } = await createMessage(newMessage, conversationDocumentId, user!.uid);
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
        if (setTitle == null) return;
        if (!friendData.displayName) return;
        setTitle(friendData.displayName);
    }, [friendData])

    useEffect(() => {
        getMessages(conversationDocumentId, setMessages)
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
                        <div className={`${styles.message} ${message.author === user!.uid ? styles.right : null}`}
                            key={index}>
                            {message.author === params.slug && <p className={styles.avatar}>{friendData?.displayName.slice(0, 2).toUpperCase()}</p>}
                            <p>{message.content}</p>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>
            <form className={styles.textbar} onSubmit={handleForm}>
                <input className={styles.textbarInput} placeholder={`Message ${friendData.displayName}`} onChange={(e) => setNewMessage(e.target.value)} value={newMessage} />
                <button className={styles.submitButton} type="submit" disabled={newMessage === ""}><FontAwesomeIcon icon={faPaperPlane} /></button>
            </form>
        </div>
    )
}
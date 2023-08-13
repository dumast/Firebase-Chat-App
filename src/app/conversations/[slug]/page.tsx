'use client';

import { AuthContext, useAuthContext } from "@/context/AuthContext";
import firebase_app from "@/firebase/config";
import { Friend, getUserData } from "@/firebase/friends";
import createMessage from "@/firebase/messages/create";
import { DocumentData, QueryDocumentSnapshot, collection, getFirestore, limit, onSnapshot, query, where } from "firebase/firestore";
import { useState, useEffect, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";

const db = getFirestore(firebase_app)

export interface Message {
    type: 'text' | 'image',
    content: string,
    author: string,
    timestamp: string,
}

export default function Page({ params }: { params: { slug: string } }) {
    const router = useRouter();

    const { user, dbUser }: AuthContext = useAuthContext();

    const [newMessage, setNewMessage] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([])
    const [friendData, setFriendData] = useState<Friend>({ id: "", displayName: "" });

    const conversationDocumentId: string = useMemo(() => [params.slug, user?.uid].sort().join("-"), []);

    async function handleForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const { result, error } = await createMessage(newMessage, conversationDocumentId, user!.uid);
        setNewMessage("");
    }

    function checkMessageType(message: DocumentData): message is Message {
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
    }, [])

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
                    <div key={index}>
                        {message.author === params.slug && <p>{friendData?.displayName}</p>}
                        {message.author === user!.uid && <p>{dbUser?.displayName || dbUser?.username}</p>}
                        <p>{message.content}</p>
                    </div>
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
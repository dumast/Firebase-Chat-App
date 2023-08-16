'use client';

import { useAuthContext } from "@/context/AuthContext";
import { getFriends } from "@/firebase/friends";
import Link from "next/link";
import { useEffect, useState } from "react";

import styles from '@/app/friends/style.module.css';

import type { _AuthContext, _Friend } from "@/utils/types";

export default function FriendList() {
    const { user, dbUser }: _AuthContext = useAuthContext();

    const [friends, setFriends] = useState<_Friend[]>([]);

    useEffect(() => {
        async function init() {
            const friends = await getFriends(user!.uid);
            setFriends(friends.sort());
        }
        init();
    }, []);

    return (<div className={styles.friendContainer}>
        <h2>Conversations</h2>
        {friends.map((friend: _Friend, index: number) => {
            return (
                <Link href={`/conversations/${friend.id}`}><button className={styles.friendButton}>{friend.displayName}</button></Link>
            )
        })}
    </div>)
}
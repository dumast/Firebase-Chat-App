'use client';

import { useAuthContext } from "@/context/AuthContext";
import { getFriends } from "@/firebase/friends";
import Link from "next/link";
import { useEffect, useState } from "react";

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

    return (<div>
        {friends.map((friend: _Friend, index: number) => {
            return (
                <div key={index}><Link href={`/conversations/${friend.id}`}>{friend.displayName}</Link></div>
            )
        })}
    </div>)
}
'use client';

import { AuthContext, useAuthContext } from "@/context/AuthContext";
import { getFriends, Friend } from "@/firebase/friends";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FriendList() {
    const { user, dbUser }: AuthContext = useAuthContext();

    const [friends, setFriends] = useState<Friend[]>([]);

    useEffect(() => {
        async function init() {
            const friends = await getFriends(user!.uid);
            setFriends(await getFriends(user!.uid));
        }
        init();
    }, []);

    return (<div>
        {friends.map((friend: Friend, index: number) => {
            return (
                <div key={index}><Link href={`/conversations/${friend.id}`}>{friend.displayName}</Link></div>
            )
        })}
    </div>)
}
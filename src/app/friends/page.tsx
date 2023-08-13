'use client';

import { AuthContext, useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { acceptFriendRequest, getFriendRequests, getFriends, getSentFriendRequests, removeFriend, sendFriendRequest } from "@/firebase/friends";
import type { Friend, Res } from "@/firebase/friends";

export default function page() {
    const router = useRouter();

    const { user, dbUser }: AuthContext = useAuthContext();

    const [newFriendUserName, setNewFriendUserName] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
    const [sentFriendRequests, setSentFriendRequests] = useState<Friend[]>([]);

    async function handleRemove(friendDelete: Friend) {
        await removeFriend(user!.uid, friendDelete.id);
        setFriends(friends.filter((friend) => friend.id !== friendDelete.id));
    };

    async function handleSendFriendRequest(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (newFriendUserName === "") return setMessage("Please enter a valid username")
        const res: Res = await sendFriendRequest(user!.uid, newFriendUserName)
        if (res.status !== 200) {
            return setMessage(res.message);
        }
        setNewFriendUserName("");
        setSentFriendRequests(sentFriendRequests.filter((sentFriendRequest) => sentFriendRequest.id !== res.message))
    };

    async function handleAcceptFriendRequest(friend: Friend) {
        await acceptFriendRequest(user!.uid, friend.id);
        setFriendRequests(friendRequests.filter((friendRequest) => friendRequest.id !== friend.id));
        setFriends([...friends, friend].sort())
    }

    useEffect(() => {
        if (user === null || dbUser === null) return router.push("/");
        async function init() {
            const friends = await getFriends(user!.uid);
            setFriends(friends.sort());
        }
        init();
    }, []);

    useEffect(() => {
        async function init() {
            const friendRequests = await getFriendRequests(user!.uid);
            setFriendRequests(friendRequests.sort());
        }
        init();
    }, []);

    useEffect(() => {
        async function init() {
            const sentFriendRequests = await getSentFriendRequests(user!.uid);
            setSentFriendRequests(sentFriendRequests.sort());
        }
        init();
    }, []);


    return (
        <div>
            <form onSubmit={(e) => handleSendFriendRequest(e)}>
                <label htmlFor="addFriend">
                    <p>Add Friend</p>
                    <input onChange={(e) => { message != "" && setMessage(""); setNewFriendUserName(e.target.value) }} value={newFriendUserName} required id="addFriend" name="addFriend" />
                </label>
                {message != "" && message}
                <button type="submit" disabled={newFriendUserName === ""}>Send Friend Request</button>
            </form>
            <h2>Friend Requests</h2>
            {friendRequests.map((friend: Friend, index: number) => {
                return (
                    <div key={index}>
                        <p>{friend.displayName}</p>
                        <button onClick={() => handleAcceptFriendRequest(friend)}>Accept Friend Request</button>
                    </div>
                )
            })}
            <h2>Sent Friend Requests</h2>
            {sentFriendRequests.map((friend: Friend, index: number) => {
                return (
                    <div key={index}>
                        <p>{friend.displayName}</p>
                    </div>
                )
            })}
            <h2>Manage Friends</h2>
            {friends.map((friend: Friend, index: number) => {
                return (
                    <div key={index}>
                        <p>{friend.displayName}</p>
                        <button onClick={() => handleRemove(friend)}>X</button>
                    </div>
                )
            })}
        </div>
    )
} 
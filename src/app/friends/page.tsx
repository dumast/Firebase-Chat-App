'use client';

import { AuthContext, useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { getFriends, getFriendRequests, getSentFriendRequests, sendFriendRequest, acceptFriendRequest, removeFriend, removeSentFriendRequest } from "@/firebase/friends";
import type { Friend, Res } from "@/firebase/friends";

export default function page() {
    const router = useRouter();

    const { user, dbUser }: AuthContext = useAuthContext();

    const [newFriendUserName, setNewFriendUserName] = useState<string>("");
    const [friendRequestMessage, setFriendRequestMessage] = useState<string>("");
    const [acceptFriendMessage, setAcceptFriendMessage] = useState<string>("");
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
    const [sentFriendRequests, setSentFriendRequests] = useState<Friend[]>([]);

    async function handleRemoveFriend(friendDelete: Friend) {
        await removeFriend(user!.uid, friendDelete.id);
        setFriends(friends.filter((friend) => friend.id !== friendDelete.id));
    };

    async function handleRemoveSentFriendRequest(friendDelete: Friend) {
        await removeSentFriendRequest(user!.uid, friendDelete.id);
        setSentFriendRequests(sentFriendRequests.filter((sentFriendRequest) => sentFriendRequest.id !== friendDelete.id));
    }

    async function handleSendFriendRequest(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (newFriendUserName === "") return setFriendRequestMessage("Please enter a valid username")
        const res: Res = await sendFriendRequest(user!.uid, newFriendUserName)
        switch (res.status) {
            case 200:
                setSentFriendRequests([...sentFriendRequests, { id: res.content!.id, displayName: newFriendUserName }].sort());
                break;
            case 206:
                setFriendRequests(friendRequests.filter((friendRequest) => friendRequest.id !== res.content!.id));
                setFriends([...friends, res.content!].sort())
                break;
            default:
                return setFriendRequestMessage(res.message);
        }
        setNewFriendUserName("");
    };

    async function handleAcceptFriendRequest(friend: Friend) {
        const res: Res = await acceptFriendRequest(user!.uid, friend.id);
        switch (res.status) {
            case 200:
                setFriendRequests(friendRequests.filter((friendRequest) => friendRequest.id !== friend.id));
                setFriends([...friends, friend].sort());
                break;
            default:
                setAcceptFriendMessage(res.message);
        }
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
                    <input onChange={(e) => { friendRequestMessage != "" && setFriendRequestMessage(""); setNewFriendUserName(e.target.value) }} value={newFriendUserName} required id="addFriend" name="addFriend" />
                </label>
                {friendRequestMessage != "" && friendRequestMessage}
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
            {acceptFriendMessage}
            <h2>Sent Friend Requests</h2>
            {sentFriendRequests.map((friend: Friend, index: number) => {
                return (
                    <div key={index}>
                        <p>{friend.displayName}</p>
                        <button onClick={() => handleRemoveSentFriendRequest(friend)}>X</button>
                    </div>
                )
            })}
            <h2>Manage Friends</h2>
            {friends.map((friend: Friend, index: number) => {
                console.log("FRIENDS: ", friend)
                return (
                    <div key={index}>
                        <p>{friend.displayName}</p>
                        <button onClick={() => handleRemoveFriend(friend)}>X</button>
                    </div>
                )
            })}
        </div>
    )
} 
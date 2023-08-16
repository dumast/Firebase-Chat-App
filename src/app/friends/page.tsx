'use client';

import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, FormEvent } from "react";
import { getFriends, getFriendRequests, getSentFriendRequests, sendFriendRequest, acceptFriendRequest, removeFriend, removeSentFriendRequest, declineFriendRequest } from "@/firebase/friends";
import styles from './style.module.css';
import authStyles from '@/app/auth/auth.module.css';

import type { _AuthContext, _CurrentPageContext, _Friend, _Res } from "@/utils/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCurrentPageContext } from "@/context/CurrentPageContext";

export default function Page() {
    const router = useRouter();

    const { user, dbUser }: _AuthContext = useAuthContext();
    const { setTitle }: _CurrentPageContext = useCurrentPageContext();


    const [newFriendUserName, setNewFriendUserName] = useState<string>("");
    const [friendRequestMessage, setFriendRequestMessage] = useState<string>("");
    const [acceptFriendMessage, setAcceptFriendMessage] = useState<string>("");

    const [friends, setFriends] = useState<_Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<_Friend[]>([]);
    const [sentFriendRequests, setSentFriendRequests] = useState<_Friend[]>([]);

    async function handleRemoveFriend(friendDelete: _Friend) {
        await removeFriend(user!.uid, friendDelete.id);
        setFriends(friends.filter((friend) => friend.id !== friendDelete.id));
    };

    async function handleRemoveSentFriendRequest(friendDelete: _Friend) {
        await removeSentFriendRequest(user!.uid, friendDelete.id);
        setSentFriendRequests(sentFriendRequests.filter((sentFriendRequest) => sentFriendRequest.id !== friendDelete.id));
    }

    async function handleSendFriendRequest(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (newFriendUserName === "") return setFriendRequestMessage("Please enter a valid username")
        const res: _Res = await sendFriendRequest(user!.uid, newFriendUserName)
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

    async function handleAcceptFriendRequest(friend: _Friend) {
        const res: _Res = await acceptFriendRequest(user!.uid, friend.id);
        switch (res.status) {
            case 200:
                setFriendRequests(friendRequests.filter((friendRequest) => friendRequest.id !== friend.id));
                setFriends([...friends, friend].sort());
                break;
            default:
                setAcceptFriendMessage(res.message);
        }
    }

    async function handleDeclineFriendRequest(friendDelete: _Friend) {
        await declineFriendRequest(user!.uid, friendDelete.id);
        setFriendRequests(friendRequests.filter((friendRequest) => friendRequest.id !== friendDelete.id));
    }

    useEffect(() => {
        if (user === null || dbUser === null) return router.push("/");
        if (setTitle != null) setTitle("Friends");
        getFriends(user!.uid, setFriends);
        getFriendRequests(user!.uid, setFriendRequests);
        getSentFriendRequests(user!.uid, setSentFriendRequests);
    }, []);

    return (
        <div>
            <div className={styles.friendContainer}>
                <h2>Manage Friends</h2>
                {friends.map((friend: _Friend, index: number) => {
                    return (
                        <div className={styles.buttonContainer} key={index}>
                            <p>{friend.displayName}</p>
                            <button className={styles.trashContainer} onClick={() => handleRemoveFriend(friend)}><FontAwesomeIcon icon={faTrash} /></button>
                        </div>
                    )
                })}
            </div>
            <form className={styles.friendContainer} onSubmit={(e) => handleSendFriendRequest(e)}>
                <div className={authStyles.inputBar}>
                    <label htmlFor="addFriend"><h2>Add Friend</h2></label>
                    <input onChange={(e) => { friendRequestMessage != "" && setFriendRequestMessage(""); setNewFriendUserName(e.target.value) }} value={newFriendUserName} required id="addFriend" name="addFriend" />
                    {friendRequestMessage != "" && friendRequestMessage}
                </div>
                <div className={authStyles.submitButton}>
                    <button type="submit" disabled={newFriendUserName === ""}>Send Friend Request</button>
                </div>
            </form>
            <div className={styles.friendContainer}>
                <h2>Friend Requests</h2>
                {friendRequests.map((friend: _Friend, index: number) => {
                    return (
                        <div className={styles.buttonContainer} key={index}>
                            <p>{friend.displayName}</p>
                            <div>
                                <button className={styles.checkContainer} onClick={() => handleAcceptFriendRequest(friend)}><FontAwesomeIcon icon={faSquareCheck} /></button>
                                <button className={styles.trashContainer} onClick={() => handleDeclineFriendRequest(friend)}><FontAwesomeIcon icon={faTrash} /></button>
                            </div>
                        </div>
                    )
                })}
                {acceptFriendMessage}
            </div>
            <div className={styles.friendContainer}>
                <h2>Sent Friend Requests</h2>
                {sentFriendRequests.map((friend: _Friend, index: number) => {
                    return (
                        <div className={styles.buttonContainer} key={index}>
                            <p>{friend.displayName}</p>
                            <button className={styles.trashContainer} onClick={() => handleRemoveSentFriendRequest(friend)}><FontAwesomeIcon icon={faTrash} /></button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
} 
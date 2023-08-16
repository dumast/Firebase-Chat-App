import { Unsubscribe, arrayRemove, arrayUnion, collection, doc, documentId, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import firebase_app from "../config";
import { authMessages, friendsMessages, globalMessages } from "@/utils/messages";

import type { _Res, _Friend } from "@/utils/types";

const db = getFirestore(firebase_app)

async function userId(username: string): Promise<string | null> {
    try {
        const q = query(collection(db, "users"), where('username', '==', username));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.docs.length === 0) return null
        return querySnapshot.docs[0].id
    } catch (e) {
        return null
    }
}

export async function getUserData(id: string) {
    try {
        const userDoc = await getDoc(doc(db, "users", id))
        if (!userDoc.exists()) return null;
        return userDoc.data();
    } catch (e) {
        return null
    }
}

async function getFriendData(uid: string, data: string, setValue: React.Dispatch<React.SetStateAction<_Friend[]>>) {
    const userQuery = query(collection(db, "users"), where(documentId(), '==', uid));
    return onSnapshot(userQuery, (doc) => {
        if (doc.docs.length == 0) return null;
        const userData = doc.docs[0].data()
        if (userData[data] == null || userData[data].length === 0) return null;
        const friendQuery = query(collection(db, "users"), where(documentId(), "in", userData[data]));
        onSnapshot(friendQuery, (doc) => {
            let friends: _Friend[] = [];
            if (doc.docs.length == 0) return null;
            doc.docs.map((friendDoc) => {
                const friendDisplayName = friendDoc.data().displayName || friendDoc.data().username
                friends.push({ id: friendDoc.id, displayName: friendDisplayName })
            })
            setValue(friends);
        })
    })
}

export function getFriends(uid: string, setValue: React.Dispatch<React.SetStateAction<_Friend[]>>): Promise<Unsubscribe> {
    return getFriendData(uid, 'friends', setValue);
}

export function getFriendRequests(uid: string, setValue: React.Dispatch<React.SetStateAction<_Friend[]>>): Promise<Unsubscribe> {
    return getFriendData(uid, 'friendRequests', setValue);
}

export function getSentFriendRequests(uid: string, setValue: React.Dispatch<React.SetStateAction<_Friend[]>>): Promise<Unsubscribe> {
    return getFriendData(uid, 'sentFriendRequests', setValue);
}

export async function sendFriendRequest(uid: string, friendUserName: string): Promise<_Res> {
    let res: _Res;
    try {
        const userData = await getUserData(uid);
        if (userData === null) {
            res = {
                status: 401,
                message: authMessages.userNotLoggedIn
            }
            return res;
        }
        const friendId = await userId(friendUserName);
        if (friendId === null) {
            res = {
                status: 404,
                message: friendsMessages.userNotFound
            }
            return res;
        }
        if (uid === friendId) {
            res = {
                status: 403,
                message: friendsMessages.selfAdd
            }
            return res;
        }
        if (userData.friends !== undefined && userData.friends.includes(friendId)) {
            res = {
                status: 400,
                message: friendsMessages.userAlreadyFriend
            }
            return res;
        }
        if (userData.sentFriendRequests !== undefined && userData.sentFriendRequests.includes(friendId)) {
            res = {
                status: 400,
                message: friendsMessages.friendRequestAlreadySent
            }
            return res;
        }
        if (userData.friendRequests !== undefined && userData.friendRequests.includes(friendId)) {
            await acceptFriendRequest(uid, friendId);
            res = {
                status: 206,
                message: friendsMessages.friendRequestAccepted,
                content: {
                    id: friendId,
                    displayName: friendUserName
                }
            }
            return res;
        }
        await updateDoc(doc(db, "users", uid), {
            sentFriendRequests: arrayUnion(friendId)
        })
        await updateDoc(doc(db, "users", friendId), {
            friendRequests: arrayUnion(uid)
        })
        res = {
            status: 200,
            message: friendsMessages.friendRequestSent,
            content: {
                id: friendId,
                displayName: friendUserName
            }
        }
        return res;
    } catch (e) {
        res = {
            status: 500,
            message: globalMessages.unknownError
        }
        return res;
    }
}

export async function acceptFriendRequest(uid: string, friendId: string): Promise<_Res> {
    let res: _Res;
    try {
        const friendData = await getUserData(friendId);
        if (friendData === null) {
            res = {
                status: 404,
                message: friendsMessages.userNotFound
            }
            return res
        }
        if (!friendData.sentFriendRequests.includes(uid)) {
            res = {
                status: 403,
                message: friendsMessages.friendRequestRetrieved
            }
            return res
        }
        await updateDoc(doc(db, "users", uid), {
            friendRequests: arrayRemove(friendId),
            friends: arrayUnion(friendId)
        })
        await updateDoc(doc(db, "users", friendId), {
            sentFriendRequests: arrayRemove(uid),
            friends: arrayUnion(uid)
        })
        res = {
            status: 200,
            message: friendsMessages.friendRequestAccepted
        }
        return res;
    } catch (e) {
        res = {
            status: 500,
            message: globalMessages.unknownError
        }
        return res;
    }
}

export async function removeFriend(uid: string, friendUid: string) {
    try {
        await updateDoc(doc(db, "users", uid), {
            friends: arrayRemove(friendUid)
        });
        await updateDoc(doc(db, "users", friendUid), {
            friends: arrayRemove(uid)
        });
    } catch (e) {

    }
}

export async function declineFriendRequest(uid: string, friendUid: string) {
    try {
        await updateDoc(doc(db, "users", uid), {
            friendRequests: arrayRemove(friendUid)
        });
        await updateDoc(doc(db, "users", friendUid), {
            sentFriendRequests: arrayRemove(uid)
        });
    } catch (e) {

    }
}

export async function removeSentFriendRequest(uid: string, friendUid: string) {
    try {
        await updateDoc(doc(db, "users", uid), {
            sentFriendRequests: arrayRemove(friendUid)
        });
        await updateDoc(doc(db, "users", friendUid), {
            friendRequests: arrayRemove(uid)
        });
    } catch (e) {

    }
}
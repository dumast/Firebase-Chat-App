import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore";
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

async function getFriendData(uid: string, data: string): Promise<_Friend[]> {
    try {
        const userData = await getUserData(uid);
        if (userData == null) return []
        if (userData[data] === undefined) return [];
        let friends: _Friend[] = [];
        for (let i = 0; i < userData[data].length; i++) {
            let friendDisplayName: string;
            const friendData = await getUserData(userData[data][i]);
            if (friendData == null) return [];
            if (friendData.displayName) {
                friendDisplayName = friendData.displayName;
            } else {
                friendDisplayName = friendData.username;
            }
            friends.push({ id: userData[data][i], displayName: friendDisplayName })
        }
        return friends;
    } catch (e) {
        return []
    }
}

export async function getFriends(uid: string): Promise<_Friend[]> {
    return getFriendData(uid, 'friends');
}

export async function getFriendRequests(uid: string): Promise<_Friend[]> {
    return getFriendData(uid, 'friendRequests');
}

export async function getSentFriendRequests(uid: string): Promise<_Friend[]> {
    return getFriendData(uid, 'sentFriendRequests');
}

export async function sendFriendRequest(uid: string, friendUserName: string): Promise<_Res> {
    let res: _Res;
    try {
        const friendId = await userId(friendUserName);
        if (friendId === null) {
            res = {
                status: 404,
                message: friendsMessages.userNotFound
            }
            return res;
        }
        const userData = await getUserData(uid);
        if (userData === null) {
            res = {
                status: 401,
                message: authMessages.userNotLoggedIn
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

export async function removeFriendRequest(uid: string, friendUid: string) {
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
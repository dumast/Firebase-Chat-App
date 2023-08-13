import { DocumentData, QueryDocumentSnapshot, QuerySnapshot, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app)

export interface Res {
    status: number,
    message: string
}

export interface Friend {
    id: string,
    displayName: string
}

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

async function getFriendData(uid: string, data: string): Promise<Friend[]> {
    try {
        const userData = await getUserData(uid);
        if (userData == null) return []
        if (userData[data] === undefined) return [];
        let friends: Friend[] = [];
        for (let i = 0; i < userData[data].length; i++) {
            let friendDisplayName: string;
            const friendData = await getUserData(userData[data][i]);
            if (friendData == null) return [];
            if (friendData.displayName) {
                friendDisplayName = friendData.displayName;
            } else {
                friendDisplayName = friendData.username;
            }
            friends.push({ id: userData[data], displayName: friendDisplayName })
        }
        return friends;
    } catch (e) {
        return []
    }
}

export async function getFriends(uid: string): Promise<Friend[]> {
    return getFriendData(uid, 'friends');
}

export async function getFriendRequests(uid: string): Promise<Friend[]> {
    return getFriendData(uid, 'friendRequests');
}

export async function getSentFriendRequests(uid: string): Promise<Friend[]> {
    return getFriendData(uid, 'sentFriendRequests');
}

export async function sendFriendRequest(uid: string, friendUserName: string) {
    let res: Res;
    try {
        const friendId = await userId(friendUserName);
        if (friendId === null) {
            res = {
                status: 404,
                message: "User not found"
            }
            return res;
        }
        await updateDoc(doc(db, "users", uid.toString()), {
            sentFriendRequests: arrayUnion(friendId.toString())
        })
        await updateDoc(doc(db, "users", friendId.toString()), {
            friendRequests: arrayUnion(uid.toString())
        })
        res = {
            status: 200,
            message: friendId
        }
        return res;
    } catch (e) {
        res = {
            status: 500,
            message: "Unknown error"
        }
        return res;
    }
}

export async function acceptFriendRequest(uid: string, friendId: string) {
    try {
        await updateDoc(doc(db, "users", uid.toString()), {
            friendRequests: arrayRemove(friendId.toString()),
            friends: arrayUnion(friendId.toString())
        })
        await updateDoc(doc(db, "users", friendId.toString()), {
            sentFriendRequests: arrayRemove(uid.toString()),
            friends: arrayUnion(uid.toString())
        })
    } catch (e) {
    }
}

export async function removeFriend(uid: string, friendUid: string) {
    try {
        await updateDoc(doc(db, "users", uid.toString()), {
            friends: arrayRemove(friendUid.toString())
        });
        await updateDoc(doc(db, "users", friendUid.toString()), {
            friends: arrayRemove(uid.toString())
        });
    } catch (e) {

    }
}
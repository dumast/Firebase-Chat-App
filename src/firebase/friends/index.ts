import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app)

export interface Friend {
    id: string,
    displayName: string
}

async function getUserData(id: string) {
    const userDoc = await getDoc(doc(db, "users", id))
    if (!userDoc.exists()) return null;
    return userDoc.data();
}

export async function getFriends(uid: string): Promise<Friend[]> {
    const userData = await getUserData(uid);
    if (userData == null) return []
    if (userData.friends === undefined) return [];
    let friends: Friend[] = [];
    for (let i = 0; i < userData.friends.length; i++) {
        let friendDisplayName: string;
        const friendData = await getUserData(userData.friends[i]);
        if (friendData == null) return [];
        if (friendData.displayName) {
            friendDisplayName = friendData.displayName;
        } else {
            friendDisplayName = friendData.username;
        }
        friends.push({ id: userData.friends, displayName: friendDisplayName })
    }
    return friends;
}
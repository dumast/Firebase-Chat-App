import { useAuthContext } from "@/context/AuthContext";
import Link from "next/link";
import signOut from "@/firebase/auth/signout";
import { useRouter } from 'next/navigation';

import type { _AuthContext } from "@/utils/types";

export default function NavBar() {
    const { user, dbUser }: _AuthContext = useAuthContext();

    const router = useRouter();

    if (user === null || dbUser === null) {
        return (<></>)
    }

    return (<header>
        <nav>
            <p>{dbUser.displayName ? dbUser.displayName : dbUser.username}</p>
            <ul>
                <li><Link href="/">Dashboard</Link></li>
                <li><Link href="/friends">Friends</Link></li>
                <a onClick={() => { signOut(); router.push("/") }}>Sign Out</a>
            </ul>
        </nav>
    </header>)
}
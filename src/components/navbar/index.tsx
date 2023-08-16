import { useAuthContext } from "@/context/AuthContext";
import Link from "next/link";
import signOut from "@/firebase/auth/signout";
import { useRouter } from 'next/navigation';
import styles from './navbar.module.css';

import type { _AuthContext } from "@/utils/types";

export default function NavBar() {
    const { user, dbUser }: _AuthContext = useAuthContext();

    const router = useRouter();

    if (user === null || dbUser === null) {
        return (<></>)
    }

    return (
        <header className={styles.container}>
            <p>{dbUser.displayName ? dbUser.displayName : dbUser.username}</p>
            <nav className={styles.nav}>
                <Link href="/"><button>Dashboard</button></Link>
                <Link href="/friends"><button>Friends</button></Link>
                <a onClick={() => { signOut(); router.push("/") }}><button>Sign Out</button></a>
            </nav>
        </header>
    )
}
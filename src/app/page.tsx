'use client';

import { useAuthContext } from '@/context/AuthContext';
import type { AuthContext } from '@/context/AuthContext';
import styles from './page.module.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FriendList from '@/components/friendList';

export default function Home() {

  const router = useRouter();

  const { user, dbUser }: AuthContext = useAuthContext();

  useEffect(() => {
    if (user === null || dbUser === null) {
      router.push("/signin");
    }
  }, [])

  return (
    <main className={styles.main}>
      <FriendList />
    </main>
  )
}

'use client';

import { useAuthContext } from '@/context/AuthContext';
import type { AuthContext } from '@/context/AuthContext';
import styles from './page.module.css';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FriendList from '@/components/conversationsList';

export default function Home() {

  const router = useRouter();

  const { user, dbUser }: AuthContext = useAuthContext();

  useEffect(() => {
    if (user === null || dbUser === null) {
      router.push("/signin");
    }
  }, [user])

  if (user === null || dbUser === null) {
    return (
      <div>Please sign in</div>
    )
  }
  return (
    <main className={styles.main}>
      <FriendList />
    </main>
  )
}

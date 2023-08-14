'use client';

import { useAuthContext } from '@/context/AuthContext';
import styles from './page.module.css';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FriendList from '@/components/conversationsList';

import type { _AuthContext } from '@/utils/types';

export default function Home() {

  const router = useRouter();

  const { user, dbUser }: _AuthContext = useAuthContext();

  useEffect(() => {
    if (user === null || dbUser === null) {
      router.push("/auth/signin");
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

'use client';

import { useAuthContext } from '@/context/AuthContext';
import styles from './page.module.css';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FriendList from '@/components/conversationsList';

import type { _AuthContext, _CurrentPageContext } from '@/utils/types';
import { useCurrentPageContext } from '@/context/CurrentPageContext';

export default function Home() {

  const router = useRouter();

  const { user, dbUser }: _AuthContext = useAuthContext();
  const { setTitle }: _CurrentPageContext = useCurrentPageContext();

  useEffect(() => {
    if (user === null || dbUser === null) {
      router.push("/auth/signin");
    }
    if(setTitle != null) setTitle("Dashboard");
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

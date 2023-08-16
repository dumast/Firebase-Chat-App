'use client'

import NavBar from '@/components/navbar';
import './globals.css'
import { AuthContextProvider } from '@/context/AuthContext';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthContextProvider>
          <NavBar />
          <div className="main">
            {children}
          </div>
        </AuthContextProvider>
      </body>
    </html>
  )
}

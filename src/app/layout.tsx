'use client'

import NavBar from '@/components/navbar';
import './globals.css'
import { AuthContextProvider } from '@/context/AuthContext';
import { CurrentPageContextProvider } from '@/context/CurrentPageContext';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthContextProvider>
          <CurrentPageContextProvider>
            <NavBar />
            <div className="main">
              {children}
            </div>
          </CurrentPageContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  )
}

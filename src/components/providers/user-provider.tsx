'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User } from '@/lib/auth-system'

interface UserContextType {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
  users: User[]
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUserState] = useState<User | null>(null)
  const [users] = useState<User[]>([])

  useEffect(() => {
    if (session?.user) {
      // Convert NextAuth session to our User format
      const userData: User = {
        id: (session.user as any).id || '',
        username: session.user.email?.split('@')[0] || '',
        email: session.user.email || '',
        password: '', // Not needed for authenticated users
        name: session.user.name || '',
        image: session.user.image || '',
        role: 'user',
        createdAt: new Date().toISOString()
      }
      setUserState(userData)
    } else {
      setUserState(null)
    }
  }, [session])

  const setUser = (newUser: User) => {
    setUserState(newUser)
  }

  const logout = async () => {
    setUserState(null)
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout, users }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

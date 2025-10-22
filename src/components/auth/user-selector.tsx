'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User, ChevronDown, LogOut } from 'lucide-react'
import { useUser } from '@/components/providers/user-provider'

export function UserSelector() {
  const { user, logout } = useUser()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) {
    return null
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{user.name}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
              Account
            </div>
            <div className="px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
            <button
              onClick={() => {
                logout()
                router.push('/auth/login')
                setIsOpen(false)
              }}
              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400"
            >
              <LogOut className="h-3 w-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

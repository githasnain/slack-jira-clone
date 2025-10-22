'use client'

import { useState } from 'react'
import {
  Search,
  Bell,
  Settings,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { UserSelector } from '@/components/auth/user-selector'
import { ThemeToggle } from '@/components/theme/theme-toggle'

interface HeaderProps {
  title?: string
  subtitle?: string
  className?: string
  onMenuClick?: () => void
}

export function Header({ title = "General", subtitle, className, onMenuClick }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className={cn(
      "flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600",
      className
    )}>
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

            {/* Channel/Project info */}
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                #{title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages, files, and more..."
            className="pl-10 pr-4"
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => setIsSearchOpen(false)}
          />
        </div>
      </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative hover:bg-primary-purple hover:text-white transition-all duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary-pink text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Settings */}
            <Button variant="ghost" size="icon" className="hover:bg-primary-purple hover:text-white transition-all duration-200">
              <Settings className="h-5 w-5" />
            </Button>

            {/* User selector */}
            <UserSelector />
          </div>
    </header>
  )
}

'use client'

import { useState } from 'react'
import { 
  MoreHorizontal, 
  Reply, 
  ThumbsUp, 
  Smile,
  Paperclip,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  user: {
    name: string
    avatar: string
    status: 'online' | 'away' | 'offline'
  }
  content: string
  timestamp: string
  reactions?: { emoji: string; count: number; users: string[] }[]
  replies?: number
}

interface MessageListProps {
  className?: string
}

const mockMessages: Message[] = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      avatar: 'JD',
      status: 'online'
    },
    content: 'Hey team! Just wanted to share the latest updates on our project. We\'ve made great progress this week.',
    timestamp: '2:30 PM',
    reactions: [
      { emoji: '👍', count: 3, users: ['Jane', 'Bob', 'Alice'] },
      { emoji: '🎉', count: 1, users: ['Jane'] }
    ],
    replies: 2
  },
  {
    id: '2',
    user: {
      name: 'Jane Smith',
      avatar: 'JS',
      status: 'away'
    },
    content: 'Thanks for the update John! The new features look amazing. I\'ll review the code changes this afternoon.',
    timestamp: '2:35 PM',
    reactions: [
      { emoji: '👀', count: 2, users: ['John', 'Bob'] }
    ]
  },
  {
    id: '3',
    user: {
      name: 'Bob Wilson',
      avatar: 'BW',
      status: 'online'
    },
    content: 'I\'ve completed the database migration. Everything looks good on my end. Ready for the next phase!',
    timestamp: '2:42 PM',
    reactions: [
      { emoji: '✅', count: 1, users: ['John'] }
    ]
  }
]

export function MessageList({ className }: MessageListProps) {
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState(mockMessages)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      user: {
        name: 'You',
        avatar: 'YO',
        status: 'online'
      },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji)
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions?.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count + 1, users: [...r.users, 'You'] }
                : r
            )
          }
        } else {
          return {
            ...msg,
            reactions: [...(msg.reactions || []), { emoji, count: 1, users: ['You'] }]
          }
        }
      }
      return msg
    }))
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-3 group hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-10 h-10 bg-primary-purple rounded-full flex items-center justify-center text-white font-medium">
                  {message.user.avatar}
                </div>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                  message.user.status === 'online' && "bg-green-500",
                  message.user.status === 'away' && "bg-yellow-500",
                  message.user.status === 'offline' && "bg-gray-400"
                )} />
              </div>
            </div>

            {/* Message content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 dark:text-white">{message.user.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-300">{message.timestamp}</span>
              </div>
              
              <p className="text-gray-700 dark:text-white dark:font-medium mb-2">{message.content}</p>
              
              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {message.reactions.map((reaction, index) => (
                    <button
                      key={index}
                      onClick={() => addReaction(message.id, reaction.emoji)}
                      className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 text-sm"
                    >
                      <span>{reaction.emoji}</span>
                      <span>{reaction.count}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  <ThumbsUp className="h-4 w-4" />
                  Add reaction
                </button>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  <Reply className="h-4 w-4" />
                  Reply
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 dark:border-gray-600 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message #general"
              className="pr-20 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 dark:hover:bg-gray-600">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 dark:hover:bg-gray-600">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

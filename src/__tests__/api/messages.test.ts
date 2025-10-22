import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/messages/route'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn()
    }
  }
}))

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('/api/messages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/messages', () => {
    it('returns messages for authenticated user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' }
      })

      const mockMessages = [
        {
          id: 'msg_1',
          content: 'Hello world',
          userId: 'user_123',
          channelId: 'channel_1',
          createdAt: new Date(),
          user: { id: 'user_123', name: 'Test User', image: null, status: 'ONLINE' },
          reactions: [],
          attachments: []
        }
      ]

      mockPrisma.message.findMany.mockResolvedValue(mockMessages)
      mockPrisma.message.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/messages?channelId=channel_1')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.messages).toHaveLength(1)
      expect(data.messages[0].content).toBe('Hello world')
      expect(data.pagination.total).toBe(1)
    })

    it('returns 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/messages')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Unauthorized')
    })

    it('handles pagination parameters', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' }
      })

      mockPrisma.message.findMany.mockResolvedValue([])
      mockPrisma.message.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/messages?limit=10&offset=20')
      const response = await GET(request)
      const data = await response.json()

      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: { channelId: undefined },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 20
      })
    })
  })

  describe('POST /api/messages', () => {
    it('creates message for authenticated user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' }
      })

      const mockMessage = {
        id: 'msg_1',
        content: 'New message',
        userId: 'user_123',
        channelId: 'channel_1',
        type: 'TEXT',
        createdAt: new Date(),
        user: { id: 'user_123', name: 'Test User', image: null, status: 'ONLINE' }
      }

      mockPrisma.message.create.mockResolvedValue(mockMessage)

      const request = new NextRequest('http://localhost:3000/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: 'New message',
          channelId: 'channel_1'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.content).toBe('New message')
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          content: 'New message',
          type: 'TEXT',
          channelId: 'channel_1',
          userId: 'user_123'
        },
        include: expect.any(Object)
      })
    })

    it('returns 400 for missing required fields', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' }
      })

      const request = new NextRequest('http://localhost:3000/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Message without channel'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Missing required fields')
    })

    it('returns 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: 'New message',
          channelId: 'channel_1'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Unauthorized')
    })
  })
})

import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'

// Check if current user is admin
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) return false

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { role: true }
    })

    return user?.role === 'ADMIN'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Check if user can manage projects (admin only)
export async function canManageProjects(): Promise<boolean> {
  return await isAdmin()
}

// Check if user can manage teams (admin only)
export async function canManageTeams(): Promise<boolean> {
  return await isAdmin()
}

// Check if user can manage users (admin only)
export async function canManageUsers(): Promise<boolean> {
  return await isAdmin()
}

// Check if user can edit any ticket (admin or ticket creator)
export async function canEditAnyTicket(ticketId: string): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) return false

    // Check if user is admin
    const isUserAdmin = await isAdmin()
    if (isUserAdmin) return true

    // Check if user created the ticket
    const ticket = await prisma.task.findUnique({
      where: { id: ticketId },
      select: { assigneeId: true }
    })

    return ticket?.assigneeId === (session.user as any).id
  } catch (error) {
    console.error('Error checking ticket edit permission:', error)
    return false
  }
}

// Check if user can delete any ticket (admin or ticket creator)
export async function canDeleteAnyTicket(ticketId: string): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) return false

    // Check if user is admin
    const isUserAdmin = await isAdmin()
    if (isUserAdmin) return true

    // Check if user created the ticket
    const ticket = await prisma.task.findUnique({
      where: { id: ticketId },
      select: { assigneeId: true }
    })

    return ticket?.assigneeId === (session.user as any).id
  } catch (error) {
    console.error('Error checking ticket delete permission:', error)
    return false
  }
}

// Get user role
export async function getUserRole(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) return null

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { role: true }
    })

    return user?.role || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

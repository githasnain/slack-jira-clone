// Simple user authentication system
export interface User {
  id: string
  name: string
  email: string
  image?: string
}

// Mock users for demonstration
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    image: ''
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    image: ''
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    image: ''
  }
]

// Get current user (in a real app, this would come from session/auth)
export function getCurrentUser(): User {
  if (typeof window === 'undefined') {
    return mockUsers[0] // Default user for server-side
  }
  
  try {
    const stored = localStorage.getItem('slack-jira-current-user')
    if (stored) {
      return JSON.parse(stored)
    }
    
    // Default to first user if no stored user
    const defaultUser = mockUsers[0]
    localStorage.setItem('slack-jira-current-user', JSON.stringify(defaultUser))
    return defaultUser
  } catch (error) {
    console.error('Error getting current user:', error)
    return mockUsers[0]
  }
}

// Set current user
export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    localStorage.setItem('slack-jira-current-user', JSON.stringify(user))
  } catch (error) {
    console.error('Error setting current user:', error)
  }
}

// Check if user can delete a ticket
export function canDeleteTicket(ticket: any, currentUser: User): boolean {
  if (!ticket.createdBy) {
    return false
  }
  
  return ticket.createdBy.id === currentUser.id
}

// Check if user can edit a ticket
export function canEditTicket(ticket: any, currentUser: User): boolean {
  if (!ticket.createdBy) {
    return false
  }
  
  return ticket.createdBy.id === currentUser.id
}




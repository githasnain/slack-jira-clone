// Enhanced authentication system with user credentials and registration
export interface User {
  id: string
  username: string
  email: string
  password: string
  name: string
  image?: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  name: string
}

// Storage key for registered users
const REGISTERED_USERS_KEY = 'slack-jira-registered-users'

// Get registered users from localStorage
function getRegisteredUsers(): User[] {
  if (typeof window === 'undefined') {
    return []
  }
  
  try {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error getting registered users:', error)
    return []
  }
}

// Save registered users to localStorage
function saveRegisteredUsers(users: User[]): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
  } catch (error) {
    console.error('Error saving registered users:', error)
  }
}

// No mock users - only real database users

// Get all users (only registered users from database)
export function getAllUsers(): User[] {
  return getRegisteredUsers()
}

// User registration function
export function registerUser(data: RegisterData): User | null {
  const registeredUsers = getRegisteredUsers()
  const allUsers = getAllUsers()
  
  // Check if username or email already exists
  const existingUser = allUsers.find(u => 
    u.username === data.username || u.email === data.email
  )
  
  if (existingUser) {
    return null // User already exists
  }
  
  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    username: data.username,
    email: data.email,
    password: data.password,
    name: data.name,
    image: '',
    role: 'user', // New users are always regular users
    createdAt: new Date().toISOString()
  }
  
  // Add to registered users
  const updatedUsers = [...registeredUsers, newUser]
  saveRegisteredUsers(updatedUsers)
  
  return newUser
}

// Authentication functions
export function authenticateUser(username: string, password: string): User | null {
  const allUsers = getAllUsers()
  const user = allUsers.find(u => 
    (u.username === username || u.email === username) && u.password === password
  )
  return user || null
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    const stored = localStorage.getItem('slack-jira-current-user')
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

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

export function logoutUser(): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    localStorage.removeItem('slack-jira-current-user')
  } catch (error) {
    console.error('Error logging out user:', error)
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
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

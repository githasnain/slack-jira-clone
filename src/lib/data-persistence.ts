// Client-side data persistence using localStorage

// Unique ID generator to prevent duplicates
let idCounter = 0
function generateUniqueId(): string {
  idCounter++
  return `ticket-${Date.now()}-${idCounter}-${Math.random().toString(36).substr(2, 9)}`
}

export interface Ticket {
  id: string
  serialNumber: number
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignee?: {
    id: string
    name: string
    image?: string
  } | null
  createdBy?: {
    id: string
    name: string
    image?: string
  }
  assignedBy?: {
    id: string
    name: string
    image?: string
  } | null
  project?: {
    id: string
    name: string
  }
  team?: {
    id: string
    name: string
  } | null
  dueDate?: string | null
  tags?: string[]
  createdAt: string
  updatedAt: string
  isUpdated?: boolean
}

const STORAGE_KEY = 'slack-jira-tasks'
const SERIAL_COUNTER_KEY = 'slack-jira-serial-counter'

// Serial number management
function getNextSerialNumber(): number {
  if (typeof window === 'undefined') {
    return 1
  }
  
  try {
    const stored = localStorage.getItem(SERIAL_COUNTER_KEY)
    const counter = stored ? parseInt(stored) : 0
    const nextSerial = counter + 1
    localStorage.setItem(SERIAL_COUNTER_KEY, nextSerial.toString())
    return nextSerial
  } catch (error) {
    console.error('Error getting serial number:', error)
    return 1
  }
}

function getCurrentSerialCounter(): number {
  if (typeof window === 'undefined') {
    return 0
  }
  
  try {
    const stored = localStorage.getItem(SERIAL_COUNTER_KEY)
    return stored ? parseInt(stored) : 0
  } catch (error) {
    console.error('Error getting serial counter:', error)
    return 0
  }
}

// Demo tasks with unique IDs and serial numbers
const demoTasks: Ticket[] = [
  {
    id: 'demo-design-landing-1',
    serialNumber: 1,
    title: 'Design new landing page',
    description: 'Create modern, responsive landing page design',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignee: { id: 'user-2', name: 'Ahmad', image: '' },
    createdBy: { id: 'user-1', name: 'Hasnain', image: '' },
    project: { id: 'project-web-app-1', name: 'Web Application' },
    dueDate: '2024-01-20',
    tags: ['design', 'frontend'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'demo-auth-implementation-2',
    serialNumber: 2,
    title: 'Implement user authentication',
    description: 'Add login/signup functionality with JWT',
    status: 'TODO',
    priority: 'URGENT',
    assignee: { id: 'user-1', name: 'Hasnain', image: '' },
    createdBy: { id: 'user-2', name: 'Ahmad', image: '' },
    project: { id: 'project-web-app-1', name: 'Web Application' },
    dueDate: '2024-01-25',
    tags: ['backend', 'auth'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  }
]

export function getStoredTasks(): Ticket[] {
  if (typeof window === 'undefined') {
    return []
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    
    // If no stored data, start with empty array
    const initialTasks: Ticket[] = []
    saveTasks(initialTasks)
    localStorage.setItem(SERIAL_COUNTER_KEY, '0')
    return initialTasks
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return []
  }
}

export function saveTasks(tasks: Ticket[]): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export function addTask(task: Ticket): void {
  const tasks = getStoredTasks()
  
  // Check if task with same ID already exists
  const existingTask = tasks.find(t => t.id === task.id)
  if (existingTask) {
    console.warn(`Task with ID ${task.id} already exists. Skipping duplicate.`)
    return
  }
  
  // Assign serial number if not already set
  if (!task.serialNumber) {
    task.serialNumber = getNextSerialNumber()
  }
  tasks.unshift(task) // Add to beginning
  saveTasks(tasks)
}

export function updateTask(taskId: string, updates: Partial<Ticket>): void {
  const tasks = getStoredTasks()
  const taskIndex = tasks.findIndex(task => task.id === taskId)
  
  if (taskIndex !== -1) {
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      isUpdated: true // Mark as updated for highlighting
    }
    saveTasks(tasks)
  }
}

export function deleteTask(taskId: string): void {
  const tasks = getStoredTasks()
  const filteredTasks = tasks.filter(task => task.id !== taskId)
  saveTasks(filteredTasks)
}

export function getTaskById(taskId: string): Ticket | null {
  const tasks = getStoredTasks()
  return tasks.find(task => task.id === taskId) || null
}

export { generateUniqueId }

// Function to clear localStorage and reset with demo data
export function resetTasksData(): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(SERIAL_COUNTER_KEY)
    // Start with empty array - no demo tasks
    saveTasks([])
  } catch (error) {
    console.error('Error resetting tasks data:', error)
  }
}

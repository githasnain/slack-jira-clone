import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProjectBoard } from '@/components/features/projects/project-board'

describe('ProjectBoard Component', () => {
  it('renders project board with columns', () => {
    render(<ProjectBoard />)
    
    expect(screen.getByText('Project Board')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('displays task cards with correct information', () => {
    render(<ProjectBoard />)
    
    // Check for task titles
    expect(screen.getByText('Design new landing page')).toBeInTheDocument()
    expect(screen.getByText('Implement user authentication')).toBeInTheDocument()
    expect(screen.getByText('Write API documentation')).toBeInTheDocument()
    expect(screen.getByText('Setup CI/CD pipeline')).toBeInTheDocument()
  })

  it('shows task descriptions', () => {
    render(<ProjectBoard />)
    
    expect(screen.getByText('Create modern, responsive landing page design')).toBeInTheDocument()
    expect(screen.getByText('Add login/signup functionality with JWT')).toBeInTheDocument()
    expect(screen.getByText('Document all REST API endpoints')).toBeInTheDocument()
  })

  it('displays task priorities with correct colors', () => {
    render(<ProjectBoard />)
    
    const highPriority = screen.getByText('high')
    const urgentPriority = screen.getByText('urgent')
    const mediumPriority = screen.getByText('medium')
    
    expect(highPriority).toHaveClass('bg-orange-100', 'text-orange-800')
    expect(urgentPriority).toHaveClass('bg-red-100', 'text-red-800')
    expect(mediumPriority).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('shows assignee information', () => {
    render(<ProjectBoard />)
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
  })

  it('displays due dates', () => {
    render(<ProjectBoard />)
    
    expect(screen.getByText('2024-01-15')).toBeInTheDocument()
    expect(screen.getByText('2024-01-10')).toBeInTheDocument()
    expect(screen.getByText('2024-01-20')).toBeInTheDocument()
  })

  it('shows task tags', () => {
    render(<ProjectBoard />)
    
    expect(screen.getByText('design')).toBeInTheDocument()
    expect(screen.getByText('frontend')).toBeInTheDocument()
    expect(screen.getByText('backend')).toBeInTheDocument()
    expect(screen.getByText('auth')).toBeInTheDocument()
  })

  it('displays project status indicators', () => {
    render(<ProjectBoard />)
    
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('planning')).toBeInTheDocument()
  })

  it('shows task counts for each column', () => {
    render(<ProjectBoard />)
    
    // Check for task counts in column headers
    const columns = screen.getAllByText(/^\d+$/)
    expect(columns.length).toBeGreaterThan(0)
  })

  it('allows adding new tasks', () => {
    render(<ProjectBoard />)
    
    const addTaskButtons = screen.getAllByText('Add task')
    expect(addTaskButtons.length).toBe(4) // One for each column
  })

  it('renders add task button with correct styling', () => {
    render(<ProjectBoard />)
    
    const addTaskButton = screen.getAllByText('Add task')[0]
    expect(addTaskButton).toHaveClass('border-dashed', 'border-gray-300')
  })
})

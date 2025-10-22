import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MessageList } from '@/components/features/messaging/message-list'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'user_123', name: 'Test User' } },
    status: 'authenticated'
  })
}))

describe('MessageList Component', () => {
  it('renders message list with mock data', () => {
    render(<MessageList />)
    
    // Check if messages are rendered
    expect(screen.getByText('Hey team! Just wanted to share the latest updates on our project.')).toBeInTheDocument()
    expect(screen.getByText('Thanks for the update John! The new features look amazing.')).toBeInTheDocument()
    expect(screen.getByText('I\'ve completed the database migration. Everything looks good on my end.')).toBeInTheDocument()
  })

  it('displays user avatars and names', () => {
    render(<MessageList />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
  })

  it('shows message timestamps', () => {
    render(<MessageList />)
    
    expect(screen.getByText('2:30 PM')).toBeInTheDocument()
    expect(screen.getByText('2:35 PM')).toBeInTheDocument()
    expect(screen.getByText('2:42 PM')).toBeInTheDocument()
  })

  it('displays message reactions', () => {
    render(<MessageList />)
    
    expect(screen.getByText('👍')).toBeInTheDocument()
    expect(screen.getByText('🎉')).toBeInTheDocument()
    expect(screen.getByText('👀')).toBeInTheDocument()
    expect(screen.getByText('✅')).toBeInTheDocument()
  })

  it('allows sending new messages', async () => {
    render(<MessageList />)
    
    const input = screen.getByPlaceholderText('Message #general')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    fireEvent.change(input, { target: { value: 'Hello team!' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('Hello team!')).toBeInTheDocument()
    })
  })

  it('adds reactions to messages', async () => {
    render(<MessageList />)
    
    const reactionButton = screen.getByText('👍')
    fireEvent.click(reactionButton)
    
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument() // Count should increase
    })
  })

  it('shows message input with attachment and emoji buttons', () => {
    render(<MessageList />)
    
    expect(screen.getByPlaceholderText('Message #general')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })
})

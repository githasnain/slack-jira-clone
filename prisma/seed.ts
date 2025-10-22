import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        status: 'ONLINE',
        role: 'ADMIN',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      }
    }),
    prisma.user.upsert({
      where: { email: 'jane@example.com' },
      update: {},
      create: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        status: 'AWAY',
        role: 'MEMBER',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
      }
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: hashedPassword,
        status: 'ONLINE',
        role: 'MEMBER',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      }
    }),
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: hashedPassword,
        status: 'OFFLINE',
        role: 'MEMBER',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      }
    })
  ])

  console.log('✅ Created users')

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      description: 'A collaborative workspace for our team',
      slug: 'demo-workspace'
    }
  })

  console.log('✅ Created workspace')

  // Create channels
  const channels = await Promise.all([
    prisma.channel.upsert({
      where: { id: 'general' },
      update: {},
      create: {
        id: 'general',
        name: 'general',
        description: 'General discussion',
        type: 'PUBLIC',
        workspaceId: workspace.id
      }
    }),
    prisma.channel.upsert({
      where: { id: 'random' },
      update: {},
      create: {
        id: 'random',
        name: 'random',
        description: 'Random chat and fun',
        type: 'PUBLIC',
        workspaceId: workspace.id
      }
    }),
    prisma.channel.upsert({
      where: { id: 'announcements' },
      update: {},
      create: {
        id: 'announcements',
        name: 'announcements',
        description: 'Important announcements',
        type: 'PUBLIC',
        workspaceId: workspace.id
      }
    })
  ])

  console.log('✅ Created channels')

  // Add users to channels
  for (const channel of channels) {
    for (const user of users) {
      await prisma.channelMember.upsert({
        where: {
          channelId_userId: {
            channelId: channel.id,
            userId: user.id
          }
        },
        update: {},
        create: {
          channelId: channel.id,
          userId: user.id,
          role: 'MEMBER'
        }
      })
    }
  }

  console.log('✅ Added users to channels')

  // Create demo messages
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        content: 'Hey team! Welcome to our new workspace. Let\'s make this project amazing! 🚀',
        type: 'TEXT',
        channelId: 'general',
        userId: users[0].id
      }
    }),
    prisma.message.create({
      data: {
        content: 'Thanks John! I\'m excited to be part of this team. Looking forward to collaborating with everyone.',
        type: 'TEXT',
        channelId: 'general',
        userId: users[1].id
      }
    }),
    prisma.message.create({
      data: {
        content: 'Same here! The new features we\'re planning look really promising.',
        type: 'TEXT',
        channelId: 'general',
        userId: users[2].id
      }
    }),
    prisma.message.create({
      data: {
        content: 'I\'ve set up the project board. Everyone should have access to it now.',
        type: 'TEXT',
        channelId: 'general',
        userId: users[0].id
      }
    }),
    prisma.message.create({
      data: {
        content: 'Perfect! I\'ll start working on the user authentication module.',
        type: 'TEXT',
        channelId: 'general',
        userId: users[1].id
      }
    })
  ])

  console.log('✅ Created demo messages')

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Web Application',
        description: 'Main web application project with modern features',
        status: 'ACTIVE',
        progress: 75,
        dueDate: new Date('2024-03-15'),
        workspaceId: workspace.id,
        members: {
          create: [
            { userId: users[0].id, role: 'OWNER' },
            { userId: users[1].id, role: 'MEMBER' },
            { userId: users[2].id, role: 'MEMBER' }
          ]
        }
      }
    }),
    prisma.project.create({
      data: {
        name: 'Mobile App',
        description: 'Cross-platform mobile application',
        status: 'ACTIVE',
        progress: 45,
        dueDate: new Date('2024-04-30'),
        workspaceId: workspace.id,
        members: {
          create: [
            { userId: users[0].id, role: 'OWNER' },
            { userId: users[3].id, role: 'MEMBER' }
          ]
        }
      }
    }),
    prisma.project.create({
      data: {
        name: 'API Development',
        description: 'RESTful API for the application',
        status: 'ACTIVE',
        progress: 90,
        dueDate: new Date('2024-02-28'),
        workspaceId: workspace.id,
        members: {
          create: [
            { userId: users[2].id, role: 'OWNER' },
            { userId: users[0].id, role: 'MEMBER' }
          ]
        }
      }
    })
  ])

  console.log('✅ Created projects')

  // Create tasks
  const tasks = await Promise.all([
    // Web Application tasks
    prisma.task.create({
      data: {
        title: 'Design landing page',
        description: 'Create modern, responsive landing page design',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigneeId: users[1].id,
        projectId: projects[0].id,
        dueDate: new Date('2024-01-20'),
        tags: ['design', 'frontend']
      }
    }),
    prisma.task.create({
      data: {
        title: 'Implement user authentication',
        description: 'Add login/signup functionality with JWT',
        status: 'TODO',
        priority: 'URGENT',
        assigneeId: users[0].id,
        projectId: projects[0].id,
        dueDate: new Date('2024-01-25'),
        tags: ['backend', 'auth']
      }
    }),
    prisma.task.create({
      data: {
        title: 'Setup database schema',
        description: 'Create and configure database tables',
        status: 'DONE',
        priority: 'HIGH',
        assigneeId: users[2].id,
        projectId: projects[0].id,
        tags: ['database', 'backend']
      }
    }),
    // Mobile App tasks
    prisma.task.create({
      data: {
        title: 'Setup React Native project',
        description: 'Initialize React Native project structure',
        status: 'DONE',
        priority: 'MEDIUM',
        assigneeId: users[3].id,
        projectId: projects[1].id,
        tags: ['mobile', 'setup']
      }
    }),
    prisma.task.create({
      data: {
        title: 'Design mobile UI components',
        description: 'Create reusable UI components for mobile app',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigneeId: users[3].id,
        projectId: projects[1].id,
        dueDate: new Date('2024-02-15'),
        tags: ['design', 'mobile']
      }
    }),
    // API Development tasks
    prisma.task.create({
      data: {
        title: 'Create REST API endpoints',
        description: 'Implement CRUD operations for all entities',
        status: 'DONE',
        priority: 'HIGH',
        assigneeId: users[2].id,
        projectId: projects[2].id,
        tags: ['api', 'backend']
      }
    }),
    prisma.task.create({
      data: {
        title: 'Write API documentation',
        description: 'Document all REST API endpoints',
        status: 'REVIEW',
        priority: 'MEDIUM',
        assigneeId: users[2].id,
        projectId: projects[2].id,
        dueDate: new Date('2024-02-10'),
        tags: ['documentation']
      }
    })
  ])

  console.log('✅ Created tasks')

  // Add some message reactions
  await Promise.all([
    prisma.messageReaction.create({
      data: {
        messageId: messages[0].id,
        userId: users[1].id,
        emoji: '👍'
      }
    }),
    prisma.messageReaction.create({
      data: {
        messageId: messages[0].id,
        userId: users[2].id,
        emoji: '🚀'
      }
    }),
    prisma.messageReaction.create({
      data: {
        messageId: messages[1].id,
        userId: users[0].id,
        emoji: '👀'
      }
    })
  ])

  console.log('✅ Created message reactions')

  console.log('🎉 Database seeded successfully!')
  console.log('\n📊 Demo Data Summary:')
  console.log(`👥 Users: ${users.length}`)
  console.log(`🏢 Workspace: ${workspace.name}`)
  console.log(`💬 Channels: ${channels.length}`)
  console.log(`📝 Messages: ${messages.length}`)
  console.log(`📋 Projects: ${projects.length}`)
  console.log(`✅ Tasks: ${tasks.length}`)
  console.log('\n🔑 Demo Login Credentials:')
  console.log('Email: john@example.com | Password: password123')
  console.log('Email: jane@example.com | Password: password123')
  console.log('Email: bob@example.com | Password: password123')
  console.log('Email: alice@example.com | Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

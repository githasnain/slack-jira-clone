import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@workspace.com' },
    update: {},
    create: {
      email: 'admin@workspace.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create regular users
  const users = [];
  const userRoles = ['MEMBER', 'MEMBER', 'MEMBER', 'MEMBER', 'MEMBER'];
  
  for (let i = 1; i <= 5; i++) {
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await prisma.user.upsert({
      where: { email: `user${i}@workspace.com` },
      update: {},
      create: {
        email: `user${i}@workspace.com`,
        name: `User ${i}`,
        password: userPassword,
        role: userRoles[i - 1] as any,
        isActive: true,
        emailVerified: new Date(),
      },
    });
    users.push(user);
  }

  console.log('✅ Regular users created:', users.length);

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Main Workspace',
      description: 'Primary workspace for the team',
      slug: 'main-workspace',
    },
  });

  console.log('✅ Workspace created:', workspace.name);

  // Create projects
  const projects = [];
  const projectData = [
    { name: 'Web Application', description: 'Main web application development', status: 'ACTIVE' },
    { name: 'Mobile App', description: 'Mobile application for iOS and Android', status: 'ON_HOLD' },
    { name: 'API Development', description: 'Backend API and microservices', status: 'ACTIVE' },
    { name: 'Data Analytics', description: 'Business intelligence and analytics platform', status: 'ON_HOLD' },
  ];

  for (const projectInfo of projectData) {
    const project = await prisma.project.create({
      data: {
        name: projectInfo.name,
        description: projectInfo.description,
        status: projectInfo.status as any,
        workspaceId: workspace.id,
      },
    });
    projects.push(project);
  }

  console.log('✅ Projects created:', projects.length);

  // Create project members
  for (const project of projects) {
    // Add admin as project member
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: admin.id,
        role: 'ADMIN',
      },
    });

    // Add some users to each project
    for (let i = 0; i < 3; i++) {
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: users[i].id,
          role: 'MEMBER',
        },
      });
    }
  }

  console.log('✅ Project members created');

  // Create channels
  const channels = [];
  const channelData = [
    { name: 'general', description: 'General discussion channel', type: 'PUBLIC' },
    { name: 'random', description: 'Random chat and off-topic discussions', type: 'PUBLIC' },
    { name: 'announcements', description: 'Important announcements and updates', type: 'PUBLIC' },
    { name: 'development', description: 'Development discussions and code reviews', type: 'PUBLIC' },
    { name: 'design', description: 'Design discussions and feedback', type: 'PUBLIC' },
  ];

  for (const channelInfo of channelData) {
    const channel = await prisma.channel.create({
      data: {
        name: channelInfo.name,
        description: channelInfo.description,
        type: channelInfo.type as any,
        workspaceId: workspace.id,
      },
    });
    channels.push(channel);
  }

  console.log('✅ Channels created:', channels.length);

  // Create channel members
  for (const channel of channels) {
    // Add admin to all channels
    await prisma.channelMember.create({
      data: {
        channelId: channel.id,
        userId: admin.id,
        role: 'ADMIN',
      },
    });

    // Add users to channels
    for (let i = 0; i < 3; i++) {
      await prisma.channelMember.create({
        data: {
          channelId: channel.id,
          userId: users[i].id,
          role: 'MEMBER',
        },
      });
    }
  }

  console.log('✅ Channel members created');

  // Create sample tickets
  const tickets = [];
  const ticketData = [
    {
      title: 'Implement user authentication',
      description: 'Add login and registration functionality with role-based access control',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      projectId: projects[0].id,
      assigneeId: users[0].id,
    },
    {
      title: 'Design landing page',
      description: 'Create modern, responsive landing page design',
      priority: 'MEDIUM',
      status: 'TODO',
      projectId: projects[0].id,
      assigneeId: users[1].id,
    },
    {
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated testing and deployment pipeline',
      priority: 'HIGH',
      status: 'TODO',
      projectId: projects[2].id,
      assigneeId: users[2].id,
    },
    {
      title: 'Mobile app wireframes',
      description: 'Create initial wireframes for mobile application',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      projectId: projects[1].id,
      assigneeId: users[3].id,
    },
    {
      title: 'Database optimization',
      description: 'Optimize database queries and add proper indexing',
      priority: 'LOW',
      status: 'DONE',
      projectId: projects[2].id,
      assigneeId: users[4].id,
    },
    {
      title: 'API documentation',
      description: 'Create comprehensive API documentation',
      priority: 'MEDIUM',
      status: 'REVIEW',
      projectId: projects[2].id,
      assigneeId: users[0].id,
    },
  ];

  for (const ticketInfo of ticketData) {
    const ticket = await prisma.task.create({
      data: {
        title: ticketInfo.title,
        description: ticketInfo.description,
        priority: ticketInfo.priority as any,
        status: ticketInfo.status as any,
        projectId: ticketInfo.projectId,
        assigneeId: ticketInfo.assigneeId,
      },
    });
    tickets.push(ticket);
  }

  console.log('✅ Tickets created:', tickets.length);

  // Create sample messages
  const messages = [];
  const messageData = [
    {
      content: 'Welcome to the workspace! Let\'s get started with our first project.',
      channelId: channels[0].id,
      userId: admin.id,
    },
    {
      content: 'I\'ve created the initial project structure. Please review and provide feedback.',
      channelId: channels[0].id,
      userId: admin.id,
    },
    {
      content: 'The authentication system is now implemented. Please test the login functionality.',
      channelId: channels[2].id,
      userId: admin.id,
    },
    {
      content: 'Great work on the landing page design! The UI looks fantastic.',
      channelId: channels[3].id,
      userId: users[0].id,
    },
    {
      content: 'I\'ve completed the database optimization. Performance has improved significantly.',
      channelId: channels[0].id,
      userId: users[4].id,
    },
  ];

  for (const messageInfo of messageData) {
    const message = await prisma.message.create({
      data: {
        content: messageInfo.content,
        channelId: messageInfo.channelId,
        userId: messageInfo.userId,
      },
    });
    messages.push(message);
  }

  console.log('✅ Messages created:', messages.length);

  // Create system logs
  const systemLogs = [];
  const logData = [
    { action: 'USER_CREATED', details: 'Admin user created during system initialization' },
    { action: 'PROJECT_CREATED', details: 'Web Application project created' },
    { action: 'CHANNEL_CREATED', details: 'General channel created' },
    { action: 'TICKET_CREATED', details: 'Authentication ticket created' },
    { action: 'LOGIN_SUCCESS', details: 'Admin user logged in successfully' },
  ];

  for (const logInfo of logData) {
    const log = await prisma.systemLog.create({
      data: {
        userId: admin.id,
        action: logInfo.action,
        details: logInfo.details,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    systemLogs.push(log);
  }

  console.log('✅ System logs created:', systemLogs.length);

  // Create admin actions
  const adminActions = [];
  const actionData = [
    { action: 'USER_MANAGEMENT', targetType: 'USER', targetId: users[0].id, details: 'User account activated' },
    { action: 'PROJECT_ASSIGNMENT', targetType: 'PROJECT', targetId: projects[0].id, details: 'User assigned to project' },
    { action: 'TICKET_ASSIGNMENT', targetType: 'TASK', targetId: tickets[0].id, details: 'Ticket assigned to user' },
  ];

  for (const actionInfo of actionData) {
    const action = await prisma.adminAction.create({
      data: {
        adminId: admin.id,
        action: actionInfo.action,
        targetType: actionInfo.targetType,
        targetId: actionInfo.targetId,
        details: actionInfo.details,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    adminActions.push(action);
  }

  console.log('✅ Admin actions created:', adminActions.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- Admin user: ${admin.email} (password: admin123)`);
  console.log(`- Regular users: ${users.length} (password: user123)`);
  console.log(`- Projects: ${projects.length}`);
  console.log(`- Channels: ${channels.length}`);
  console.log(`- Tickets: ${tickets.length}`);
  console.log(`- Messages: ${messages.length}`);
  console.log(`- System logs: ${systemLogs.length}`);
  console.log(`- Admin actions: ${adminActions.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
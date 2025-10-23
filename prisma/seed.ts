import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vertexai.com' },
    update: {},
    create: {
      email: 'admin@vertexai.com',
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

  // Create or get workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'main-workspace' },
    update: {},
    create: {
      name: 'Main Workspace',
      description: 'Primary workspace for the team',
      slug: 'main-workspace',
    },
  });

  console.log('✅ Workspace created:', workspace.name);

  // Create projects
  const projects = [];
  const projectData = [
    { name: 'Cup Streaming', description: 'Live streaming platform for gaming and entertainment', status: 'ACTIVE' },
    { name: 'Tiptok', description: 'Social media platform with short-form video content', status: 'ACTIVE' },
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

  // Create teams for each project
  const teams = [];
  const teamData = [
    { name: 'Designing', type: 'DESIGN', projectId: projects[0].id },
    { name: 'Frontend', type: 'FRONTEND', projectId: projects[0].id },
    { name: 'Backend', type: 'BACKEND', projectId: projects[0].id },
    { name: 'Designing', type: 'DESIGN', projectId: projects[1].id },
    { name: 'Frontend', type: 'FRONTEND', projectId: projects[1].id },
    { name: 'Backend', type: 'BACKEND', projectId: projects[1].id },
  ];

  for (const teamInfo of teamData) {
    const team = await prisma.team.create({
      data: {
        name: teamInfo.name,
        description: `${teamInfo.name} team for ${teamInfo.type.toLowerCase()} development`,
        type: teamInfo.type as any,
        projectId: teamInfo.projectId,
      },
    });
    teams.push(team);
  }

  console.log('✅ Teams created:', teams.length);

  // Create team members
  for (const team of teams) {
    // Add admin to all teams
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: admin.id,
        role: 'LEAD',
      },
    });

    // Add users to teams based on project
    const projectIndex = projects.findIndex(p => p.id === team.projectId);
    const startUserIndex = projectIndex * 2; // Different users for each project
    
    for (let i = 0; i < 2; i++) {
      const userIndex = (startUserIndex + i) % users.length;
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: users[userIndex].id,
          role: 'MEMBER',
        },
      });
    }
  }

  console.log('✅ Team members created');

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
    // Cup Streaming project tickets
    {
      title: 'Design streaming interface',
      description: 'Create user interface for live streaming functionality',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      projectId: projects[0].id,
      teamId: teams[0].id, // Designing team
      assigneeId: users[0].id,
    },
    {
      title: 'Implement video player',
      description: 'Build responsive video player component',
      priority: 'HIGH',
      status: 'TODO',
      projectId: projects[0].id,
      teamId: teams[1].id, // Frontend team
      assigneeId: users[1].id,
    },
    {
      title: 'Setup streaming server',
      description: 'Configure RTMP server for live streaming',
      priority: 'URGENT',
      status: 'TODO',
      projectId: projects[0].id,
      teamId: teams[2].id, // Backend team
      assigneeId: users[2].id,
    },
    // Tiptok project tickets
    {
      title: 'Design video feed UI',
      description: 'Create TikTok-style video feed interface',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      projectId: projects[1].id,
      teamId: teams[3].id, // Designing team
      assigneeId: users[3].id,
    },
    {
      title: 'Implement video upload',
      description: 'Build video upload and processing functionality',
      priority: 'HIGH',
      status: 'TODO',
      projectId: projects[1].id,
      teamId: teams[4].id, // Frontend team
      assigneeId: users[4].id,
    },
    {
      title: 'Create recommendation engine',
      description: 'Build AI-powered video recommendation system',
      priority: 'MEDIUM',
      status: 'IN_REVIEW',
      projectId: projects[1].id,
      teamId: teams[5].id, // Backend team
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
        teamId: ticketInfo.teamId,
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
  console.log(`- Projects: ${projects.length} (Cup Streaming, Tiptok)`);
  console.log(`- Teams: ${teams.length} (3 teams per project: Designing, Frontend, Backend)`);
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
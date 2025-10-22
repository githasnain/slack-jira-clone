import { prisma } from './prisma';

export interface MentionNotification {
  userId: string;
  message: string;
  ticketId: string;
  ticketTitle: string;
  mentionedBy: string;
}

export async function parseMentionsAndCreateNotifications(
  description: string,
  ticketId: string,
  ticketTitle: string,
  mentionedBy: string,
  mentionedByUserId: string
): Promise<void> {
  // Regex to find @username mentions
  const mentionRegex = /@(\w+)/g;
  const mentions = description.match(mentionRegex);
  
  if (!mentions) return;

  // Extract usernames from @mentions
  const usernames = mentions.map(mention => mention.substring(1)); // Remove @ symbol
  
  // Find users by username (assuming username is the email prefix or a separate field)
  // For now, we'll search by email prefix or name
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { startsWith: usernames[0] } }, // Email prefix match
        { name: { in: usernames } }, // Name match
        { email: { in: usernames } } // Direct email match
      ]
    }
  });

  // Create notifications for each mentioned user
  const notifications = users.map(user => ({
    userId: user.id,
    message: `${mentionedBy} mentioned you in ticket "${ticketTitle}"`,
    read: false,
    createdAt: new Date()
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications
    });
  }
}

export async function createTicketNotification(
  ticketId: string,
  ticketTitle: string,
  action: 'created' | 'assigned' | 'updated' | 'commented',
  actorName: string,
  targetUserId: string
): Promise<void> {
  const actionMessages = {
    created: `${actorName} created a new ticket "${ticketTitle}"`,
    assigned: `${actorName} assigned you to ticket "${ticketTitle}"`,
    updated: `${actorName} updated ticket "${ticketTitle}"`,
    commented: `${actorName} commented on ticket "${ticketTitle}"`
  };

  await prisma.notification.create({
    data: {
      userId: targetUserId,
      message: actionMessages[action],
      read: false
    }
  });
}




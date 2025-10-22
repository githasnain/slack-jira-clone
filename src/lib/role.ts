/**
 * Role-based access control utilities
 */

export type UserRole = 'ADMIN' | 'MEMBER' | 'GUEST';

export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN';
}

export function isMember(role: UserRole): boolean {
  return ['ADMIN', 'MEMBER'].includes(role);
}

export function isGuest(role: UserRole): boolean {
  return role === 'GUEST';
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    'GUEST': 0,
    'MEMBER': 1,
    'ADMIN': 2,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canAccessAdminFeatures(role: UserRole): boolean {
  return isAdmin(role);
}

export function canCreateProjects(role: UserRole): boolean {
  return ['ADMIN', 'MEMBER'].includes(role);
}

export function canManageUsers(role: UserRole): boolean {
  return isAdmin(role);
}

export function canViewAllTickets(role: UserRole): boolean {
  return ['ADMIN', 'MEMBER'].includes(role);
}

export function canEditTickets(role: UserRole): boolean {
  return ['ADMIN', 'MEMBER'].includes(role);
}

export function canDeleteTickets(role: UserRole): boolean {
  return isAdmin(role);
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames = {
    'ADMIN': 'Administrator',
    'MEMBER': 'Member',
    'GUEST': 'Guest',
  };

  return displayNames[role];
}

export function getRoleColor(role: UserRole): string {
  const colors = {
    'ADMIN': 'bg-red-100 text-red-800',
    'MEMBER': 'bg-blue-100 text-blue-800',
    'GUEST': 'bg-gray-100 text-gray-800',
  };

  return colors[role];
}

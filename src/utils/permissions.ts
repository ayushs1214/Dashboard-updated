import type { AdminPermission, PermissionGroup } from '../types/admin';

export const permissionGroups: PermissionGroup[] = [
  {
    name: 'User Management',
    permissions: [
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'users.view_assigned',
      'users.approve_dealer'
    ]
  },
  {
    name: 'Product Management',
    permissions: [
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'products.view_cost',
      'products.preorder'
    ]
  },
  {
    name: 'Order Management',
    permissions: [
      'orders.view',
      'orders.process',
      'orders.edit'
    ]
  },
  {
    name: 'Inventory Management',
    permissions: [
      'inventory.view',
      'inventory.manage'
    ]
  },
  {
    name: 'Sample Management',
    permissions: [
      'samples.view',
      'samples.manage'
    ]
  },
  {
    name: 'Expo Management',
    permissions: [
      'expo.view',
      'expo.manage'
    ]
  },
  {
    name: 'Payment Management',
    permissions: [
      'payments.view',
      'payments.manage'
    ]
  },
  {
    name: 'Analytics',
    permissions: [
      'analytics.view',
      'analytics.view_performance'
    ]
  },
  {
    name: 'Settings',
    permissions: [
      'settings.view',
      'settings.manage'
    ]
  }
];

export const getPermissionLabel = (permission: AdminPermission): string => {
  const [module, action] = permission.split('.');
  return `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.charAt(0).toUpperCase() + module.slice(1)}`;
};

export const hasPermission = (userPermissions: AdminPermission[], requiredPermission: AdminPermission): boolean => {
  if (userPermissions.includes('all')) {
    return true;
  }
  return userPermissions.includes(requiredPermission);
};

export const can = (permissions: AdminPermission[], action: string, subject: string): boolean => {
  const permission = `${subject}.${action}` as AdminPermission;
  return hasPermission(permissions, permission);
};

export const getDefaultPermissions = (role: string): AdminPermission[] => {
  if (role === 'superadmin') {
    return ['all'];
  }

  const defaultPermissions: Record<string, AdminPermission[]> = {
    admin: [
      'users.view_assigned',
      'users.create',
      'users.edit',
      'products.view',
      'products.create',
      'products.edit',
      'orders.view',
      'orders.process',
      'inventory.view',
      'inventory.manage',
      'samples.view',
      'samples.manage',
      'analytics.view',
      'analytics.view_performance',
      'settings.view'
    ],
    dealer: [
      'products.view',
      'orders.view',
      'orders.process',
      'samples.view'
    ],
    architect: [
      'products.view',
      'samples.view',
      'samples.manage'
    ],
    builder: [
      'products.view',
      'orders.view',
      'samples.view'
    ]
  };

  return defaultPermissions[role] || [];
};

export const getAllPermissions = (): AdminPermission[] => {
  return permissionGroups.flatMap(group => group.permissions);
};

export const canViewUserList = (permissions: AdminPermission[], userRole: string): boolean => {
  // Superadmin can view all users
  if (permissions.includes('all')) {
    return true;
  }

  // Regular admin can only view assigned users
  if (permissions.includes('users.view_assigned')) {
    return true;
  }

  return false;
};

export const canApproveDealer = (permissions: AdminPermission[]): boolean => {
  return permissions.includes('all') || permissions.includes('users.approve_dealer');
};

export const canViewProductCost = (permissions: AdminPermission[]): boolean => {
  return permissions.includes('all') || permissions.includes('products.view_cost');
};

export const canAccessPreorder = (permissions: AdminPermission[]): boolean => {
  return permissions.includes('all') || permissions.includes('products.preorder');
};
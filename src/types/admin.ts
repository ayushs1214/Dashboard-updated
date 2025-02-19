export type AdminPermission = 
  | 'users.view' 
  | 'users.create' 
  | 'users.edit' 
  | 'users.delete'
  | 'users.view_assigned'
  | 'users.approve_dealer'
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'products.view_cost'
  | 'products.preorder'
  | 'orders.view'
  | 'orders.process'
  | 'orders.edit'
  | 'inventory.view'
  | 'inventory.manage'
  | 'samples.view'
  | 'samples.manage'
  | 'expo.view'
  | 'expo.manage'
  | 'payments.view'
  | 'payments.manage'
  | 'analytics.view'
  | 'analytics.view_performance'
  | 'settings.view'
  | 'settings.manage'
  | 'all';

export interface PermissionGroup {
  name: string;
  permissions: AdminPermission[];
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin' | 'dealer' | 'architect' | 'builder';
  avatar: string;
  status: 'active' | 'inactive';
  permissions: AdminPermission[];
  lastLogin: string;
  createdAt: string;
  phone?: string;
  department?: string;
  signature?: string;
  assignedUsers?: string[]; // IDs of users assigned to this admin
}

export interface UserAssignment {
  adminId: string;
  userId: string;
  assignedAt: string;
}

export type AdminStore = {
  admins: AdminProfile[];
  addAdmin: (admin: AdminProfile) => void;
  updateAdmin: (id: string, updates: Partial<AdminProfile>) => void;
  deleteAdmin: (id: string) => void;
  getAdmin: (id: string) => AdminProfile | undefined;
  getAdminByEmail: (email: string) => AdminProfile | undefined;
  assignUserToAdmin: (adminId: string, userId: string) => void;
  removeUserFromAdmin: (adminId: string, userId: string) => void;
  getAssignedUsers: (adminId: string) => string[];
};
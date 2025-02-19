import { useAuthStore } from '../store/authStore';
import { 
  can, 
  hasPermission, 
  canViewUserList, 
  canApproveDealer,
  canViewProductCost,
  canAccessPreorder
} from '../utils/permissions';
import type { AdminPermission } from '../types/admin';

export function usePermissions() {
  const user = useAuthStore(state => state.user);

  return {
    can: (action: string, subject: string) => {
      if (!user) return false;
      return can(user.permissions, action, subject);
    },
    hasPermission: (permission: AdminPermission) => {
      if (!user) return false;
      return hasPermission(user.permissions, permission);
    },
    canViewUserList: () => {
      if (!user) return false;
      return canViewUserList(user.permissions, user.role);
    },
    canApproveDealer: () => {
      if (!user) return false;
      return canApproveDealer(user.permissions);
    },
    canViewProductCost: () => {
      if (!user) return false;
      return canViewProductCost(user.permissions);
    },
    canAccessPreorder: () => {
      if (!user) return false;
      return canAccessPreorder(user.permissions);
    },
    permissions: user?.permissions || [],
    role: user?.role
  };
}
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export interface UserPermissions {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canManageUsers: boolean;
  canManageAdmins: boolean;
  canManageSuperAdmins: boolean;
  canManageCases: boolean;
  canManageSystem: boolean;
  canDeleteUsers: boolean;
}

export const usePermissions = (): UserPermissions => {
  const user = useSelector((state: RootState) => state.auth.user);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return {
    isAdmin,
    isSuperAdmin,
    canManageUsers: isAdmin, // 管理員和超級管理員都可以管理用戶
    canManageAdmins: isAdmin, // 管理員和超級管理員都可以管理其他管理員
    canManageSuperAdmins: isSuperAdmin, // 只有超級管理員可以管理其他超級管理員
    canManageCases: isAdmin, // 管理員和超級管理員都可以管理案例
    canManageSystem: isSuperAdmin, // 只有超級管理員可以管理系統設置
    canDeleteUsers: isSuperAdmin, // 只有超級管理員可以刪除用戶
  };
};

// 權限檢查的輔助函數
export const checkPermission = (requiredRole: 'admin' | 'super_admin', userRole?: string): boolean => {
  if (!userRole) return false;
  
  if (requiredRole === 'super_admin') {
    return userRole === 'super_admin';
  }
  
  if (requiredRole === 'admin') {
    return userRole === 'admin' || userRole === 'super_admin';
  }
  
  return false;
};

// 獲取用戶角色顯示名稱
export const getRoleDisplayName = (role?: string): string => {
  switch (role) {
    case 'super_admin':
      return '超級管理員';
    case 'admin':
      return '管理員';
    case 'user':
      return '用戶';
    default:
      return '未知';
  }
};

// 獲取用戶類型顯示名稱
export const getUserTypeDisplayName = (userType?: string): string => {
  switch (userType) {
    case 'super_admin':
      return '超級管理員';
    case 'admin':
      return '管理員';
    case 'tutor':
      return '導師';
    case 'student':
      return '學生';
    case 'organization':
      return '機構';
    default:
      return '未知';
  }
}; 
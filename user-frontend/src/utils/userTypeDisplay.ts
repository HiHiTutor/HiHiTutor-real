export const getUserTypeDisplay = (userType: string): string => {
  switch (userType) {
    case 'student':
      return '學生';
    case 'tutor':
      return '導師';
    case 'organization':
      return '機構用戶';
    default:
      return '未知';
  }
}; 
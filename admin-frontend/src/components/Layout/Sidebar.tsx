import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  BarChart as BarChartIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Campaign as CampaignIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../hooks/useNotifications';

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useNotifications();

  const menuItems = [
    { text: '儀表板', icon: <DashboardIcon />, path: '/dashboard' },
    { text: '用戶管理', icon: <PeopleIcon />, path: '/users' },
    { text: '案例管理', icon: <DescriptionIcon />, path: '/cases', badge: notifications?.openCases },
    { text: '學生案例審批', icon: <DescriptionIcon />, path: '/student-case-approvals', badge: notifications?.pendingStudentCases },
    { text: '文章審批', icon: <ArticleIcon />, path: '/article-approvals' },
    { text: '廣告管理', icon: <CampaignIcon />, path: '/AdManager' },
    { text: '統計分析', icon: <BarChartIcon />, path: '/statistics' },
    { text: '搜尋統計', icon: <SearchIcon />, path: '/search-statistics' },
    { text: '導師申請審核', icon: <SchoolIcon />, path: '/tutor-applications', badge: notifications?.pendingTutorApplications },
    { text: '導師資料審批', icon: <SchoolIcon />, path: '/tutor-profile-approvals', badge: notifications?.pendingTutorProfiles },
    { text: '導師修改監控', icon: <NotificationsIcon />, path: '/tutor-change-monitor', badge: notifications?.tutorChanges },
    { text: '科目管理', icon: <CategoryIcon />, path: '/category-manager' },
    { text: '教學模式管理', icon: <SettingsIcon />, path: '/mode-manager' },
  ];

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
        }),
        ...(!open && {
          width: (theme) => theme.spacing(7),
          '& .MuiDrawer-paper': {
            width: (theme) => theme.spacing(7),
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
          },
        }),
      }}
    >
      <List sx={{ mt: 8 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>
              {item.badge ? (
                <Badge 
                  badgeContent={item.badge} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#f44336',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                    }
                  }}
                >
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
};

export default Sidebar; 
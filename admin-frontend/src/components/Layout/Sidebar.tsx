import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  BarChart as BarChartIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Cases', icon: <DescriptionIcon />, path: '/cases' },
  { text: 'Statistics', icon: <BarChartIcon />, path: '/statistics' },
  { text: '導師申請審核', icon: <SchoolIcon />, path: '/tutor-applications' },
];

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const location = useLocation();
  const navigate = useNavigate();

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
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
};

export default Sidebar; 
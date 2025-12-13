'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CareerIcon from '@mui/icons-material/TrendingUp';
import LdIcon from '@mui/icons-material/School';
import RewardIcon from '@mui/icons-material/EmojiEvents';
import ComingSoonIcon from '@mui/icons-material/HourglassEmpty';
import MasterDataIcon from '@mui/icons-material/Storage';
import UserIcon from '@mui/icons-material/People';
import CreateCourseIcon from '@mui/icons-material/AddCircle';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import { useTranslations } from 'next-intl';

const drawerWidth = 240;

interface SidebarProps {
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
}

const SummaryIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 12L2 22h20L12 12z" />
    </svg>
);

const MENU_ITEMS = [
    { text: 'Summary', icon: <SummaryIcon />, path: '/summary' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Career Plan', icon: <CareerIcon />, path: '/career-plan' },
    { text: 'L&D Plan', icon: <LdIcon />, path: '/ld-plan' },
    { text: 'Reward Hub', icon: <RewardIcon />, path: '/reward-hub' },
    { text: 'Coming Soon', icon: <ComingSoonIcon />, path: '/coming-soon' },
];

const ADMIN_ITEMS = [
    { text: 'Create Course', icon: <CreateCourseIcon />, path: '/admin/courses' },
    { text: 'Master Data', icon: <MasterDataIcon />, path: '/admin/master-data' },
    { text: 'User Management', icon: <UserIcon />, path: '/admin/users' },
];

export default function Sidebar({ mobileOpen, handleDrawerToggle }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('Common');

    const { user } = useAuth();
    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    // Move menu items inside component or use keys
    const menuItems = [
        { text: t('summary'), icon: <SummaryIcon />, path: '/summary' },
        { text: t('dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
        { text: t('careerPlan'), icon: <CareerIcon />, path: '/career-plan' },
        { text: t('ldPlan'), icon: <LdIcon />, path: '/ld-plan' },
        { text: t('rewardHub'), icon: <RewardIcon />, path: '/reward-hub' },
        { text: t('comingSoon'), icon: <ComingSoonIcon />, path: '/coming-soon' },
    ];

    const adminItems = [
        { text: t('createCourse'), icon: <CreateCourseIcon />, path: '/admin/courses' },
        { text: t('masterData'), icon: <MasterDataIcon />, path: '/admin/master-data' },
        { text: t('userManagement'), icon: <UserIcon />, path: '/admin/users' },
    ];

    const handleNavigation = (path: string) => {
        router.push(path);
        // Close drawer on mobile after navigation
        if (mobileOpen) {
            handleDrawerToggle();
        }
    };

    const drawerContent = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    WiserAi
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            selected={pathname === item.path}
                            onClick={() => handleNavigation(item.path)}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            {isAdminOrManager && (
                <>
                    <Divider />
                    <List>
                        <ListItem>
                            <ListItemText primary={t('admin')} primaryTypographyProps={{ style: { fontWeight: 'bold' } }} />
                        </ListItem>
                        {adminItems.map((item) => (
                            <ListItem key={item.path} disablePadding>
                                <ListItemButton
                                    selected={pathname === item.path}
                                    onClick={() => handleNavigation(item.path)}
                                >
                                    <ListItemIcon>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </>
            )}
        </div>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="mailbox folders"
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}

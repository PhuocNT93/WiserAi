'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/useResponsive';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

const drawerWidth = 240;

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
    const isMobile = useIsMobile();
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [anchorElLang, setAnchorElLang] = React.useState<null | HTMLElement>(null);
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogoutClick = () => {
        handleUserMenuClose();
        setLogoutDialogOpen(true);
    };

    const handleLogoutConfirm = () => {
        // Implement actual logout logic here
        // For now, just show a message and redirect
        console.log('User logged out');
        setLogoutDialogOpen(false);

        // You can add navigation to login page here
        // window.location.href = '/login';
        alert('Logged out successfully!');
    };

    const handleLogoutCancel = () => {
        setLogoutDialogOpen(false);
    };

    // Close drawer when switching from mobile to desktop
    React.useEffect(() => {
        if (!isMobile && mobileOpen) {
            setMobileOpen(false);
        }
    }, [isMobile, mobileOpen]);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        handleCloseUserMenu();
        logout();
    };

    const handleOpenLangMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElLang(event.currentTarget);
    };

    const handleCloseLangMenu = () => {
        setAnchorElLang(null);
    };

    const changeLanguage = (locale: string) => {
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
        handleCloseLangMenu();
        router.refresh();
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: user ? { sm: `calc(100% - ${drawerWidth}px)` } : '100%',
                    ml: user ? { sm: `${drawerWidth}px` } : 0,
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                elevation={1}
            >
                <Toolbar>
                    {user && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        WiserAi by Cyberlogitec
                    </Typography>

                    {/* Language Switcher */}
                    <Box sx={{ flexGrow: 0, mr: 2 }}>
                        <IconButton onClick={handleOpenLangMenu} color="inherit">
                            <LanguageIcon />
                        </IconButton>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar-lang"
                            anchorEl={anchorElLang}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElLang)}
                            onClose={handleCloseLangMenu}
                        >
                            <MenuItem onClick={() => changeLanguage('en')}>
                                <Typography textAlign="center">English</Typography>
                            </MenuItem>
                            <MenuItem onClick={() => changeLanguage('vi')}>
                                <Typography textAlign="center">Tiếng Việt</Typography>
                            </MenuItem>
                            <MenuItem onClick={() => changeLanguage('ko')}>
                                <Typography textAlign="center">한국어</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>

                    {user ? (
                        <>
                            {/* Notifications */}
                            <IconButton color="inherit" sx={{ mr: 2 }}>
                                <Badge badgeContent={4} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>

                            {/* User Profile */}
                            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                                    {user.fullName}
                                </Typography>
                                <Tooltip title="Open settings">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Avatar alt={user ? user.fullName : "User"} src={user?.avatarUrl || "/static/images/avatar/2.jpg"} />
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    <MenuItem onClick={() => { handleCloseUserMenu(); router.push('/profile'); }}>
                                        <Typography textAlign="center">Profile</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { handleCloseUserMenu(); router.push('/change-password'); }}>
                                        <Typography textAlign="center">Change Password</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <Typography textAlign="center">Logout</Typography>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </>
                    ) : (
                        <Button color="inherit" onClick={() => router.push('/')}>Login</Button>
                    )}
                </Toolbar>
            </AppBar>
            {user && <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: user ? { sm: `calc(100% - ${drawerWidth}px)` } : '100%',
                    minHeight: '100vh',
                    backgroundColor: (theme) => theme.palette.background.default,
                    mt: 8 // Add margin top for AppBar
                }}
            >
                {/* <Toolbar /> removed inside because we use explicit margin or padding */}
                {children}
            </Box>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={logoutDialogOpen}
                onClose={handleLogoutCancel}
                aria-labelledby="logout-dialog-title"
            >
                <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to logout?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleLogoutCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleLogoutConfirm} color="primary" variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}


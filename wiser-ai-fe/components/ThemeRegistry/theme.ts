import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2196F3',
        },
        secondary: {
            main: '#9c27b0',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        // Mobile-first typography
        h1: {
            fontSize: '2rem',
            '@media (min-width:600px)': {
                fontSize: '2.5rem',
            },
            '@media (min-width:960px)': {
                fontSize: '3rem',
            },
        },
        h2: {
            fontSize: '1.75rem',
            '@media (min-width:600px)': {
                fontSize: '2rem',
            },
            '@media (min-width:960px)': {
                fontSize: '2.5rem',
            },
        },
        h3: {
            fontSize: '1.5rem',
            '@media (min-width:600px)': {
                fontSize: '1.75rem',
            },
            '@media (min-width:960px)': {
                fontSize: '2rem',
            },
        },
        body1: {
            fontSize: '0.875rem',
            '@media (min-width:600px)': {
                fontSize: '0.9375rem',
            },
            '@media (min-width:960px)': {
                fontSize: '1rem',
            },
        },
        body2: {
            fontSize: '0.8125rem',
            '@media (min-width:600px)': {
                fontSize: '0.875rem',
            },
            '@media (min-width:960px)': {
                fontSize: '0.875rem',
            },
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    // Touch-friendly minimum size
                    minHeight: 44,
                    '@media (max-width:600px)': {
                        minHeight: 48,
                    },
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    // Touch-friendly size on mobile
                    '@media (max-width:600px)': {
                        padding: 12,
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    // Touch-friendly input fields
                    '& .MuiInputBase-input': {
                        '@media (max-width:600px)': {
                            fontSize: '16px', // Prevents zoom on iOS
                        },
                    },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    // Smooth transitions
                    transition: 'transform 0.3s ease-in-out',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    // Mobile-optimized app bar
                    '@media (max-width:600px)': {
                        minHeight: 56,
                    },
                },
            },
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    '@media (max-width:600px)': {
                        minHeight: 56,
                        paddingLeft: 16,
                        paddingRight: 16,
                    },
                },
            },
        },
    },
});

export default theme;


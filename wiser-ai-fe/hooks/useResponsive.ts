'use client';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export function useResponsive(query: 'up' | 'down' | 'between' | 'only', start: Breakpoint, end?: Breakpoint) {
    const theme = useTheme();

    const mediaUp = useMediaQuery(theme.breakpoints.up(start));
    const mediaDown = useMediaQuery(theme.breakpoints.down(start));
    const mediaBetween = useMediaQuery(theme.breakpoints.between(start, end || start));
    const mediaOnly = useMediaQuery(theme.breakpoints.only(start));

    if (query === 'up') {
        return mediaUp;
    }

    if (query === 'down') {
        return mediaDown;
    }

    if (query === 'between') {
        return mediaBetween;
    }

    return mediaOnly;
}

export function useWidth() {
    const theme = useTheme();
    const keys = [...theme.breakpoints.keys].reverse();

    return (
        keys.reduce((output: Breakpoint | null, key: Breakpoint) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const matches = useMediaQuery(theme.breakpoints.up(key));
            return !output && matches ? key : output;
        }, null) || 'xs'
    );
}

export function useIsMobile() {
    return useResponsive('down', 'sm');
}

export function useIsTablet() {
    return useResponsive('between', 'sm', 'md');
}

export function useIsDesktop() {
    return useResponsive('up', 'lg');
}

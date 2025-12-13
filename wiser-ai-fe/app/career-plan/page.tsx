'use client';

import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Container, Paper } from '@mui/material';
import GrowthMapWizard from '@/components/career-plan/GrowthMapWizard';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function CareerPlanPage() {
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>Career Plan</Typography>
            <Paper sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="career plan tabs">
                        <Tab label="Growth Map Plan" />
                        <Tab label="History" />
                    </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <GrowthMapWizard />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <Typography>History list will appear here.</Typography>
                </CustomTabPanel>
            </Paper>
        </Container>
    );
}
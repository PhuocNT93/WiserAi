'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

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
    const [value, setValue] = React.useState(0);
    const [growthMap, setGrowthMap] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const generateGrowthMap = async () => {
        setLoading(true);
        try {
            // Call Backend API
            const userProfile = {
                name: 'Logan McNeil',
                currentRole: 'HR Service Partner',
                skills: ['Communication', 'Data Analysis', 'Conflict Resolution'],
                goal: 'HR Director'
            };

            // Mocking the fetch call since backend might not be running or reachable yet
            // In real scenario: await fetch('http://localhost:3000/career-plan/generate-growth-map', ...)

            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            setGrowthMap({
                source: 'mock',
                milestones: [
                    { id: 1, title: 'Year 1: Strengthen Leadership', description: 'Lead cross-functional HR projects.' },
                    { id: 2, title: 'Year 2: Strategic HR', description: 'Obtain SHRM-SCP certification.' },
                    { id: 3, title: 'Year 3: Director Role', description: 'Transition to HR Director role.' },
                ]
            });

        } catch (error) {
            console.error("Error generating map", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Growth Map" />
                </Tabs>
            </Box>

            {/* Tab: Growth Map */}
            <CustomTabPanel value={value} index={0}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Career Growth Roadmap</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Use our AI-powered tool to generate a personalized career growth plan based on your skills and goals.
                    </Typography>
                    <Button variant="contained" onClick={generateGrowthMap} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : "Generate Growth Map with AI"}
                    </Button>
                </Box>

                {growthMap && (
                    <Paper sx={{ p: 3 }}>
                        <List>
                            {growthMap.milestones.map((ms: any) => (
                                <div key={ms.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={ms.title}
                                            secondary={ms.description}
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </div>
                            ))}
                        </List>
                    </Paper>
                )}
            </CustomTabPanel>
        </Box>
    );
}

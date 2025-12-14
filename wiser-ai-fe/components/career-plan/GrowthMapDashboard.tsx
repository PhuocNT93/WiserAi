'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import { CircularProgress as MuiCircularProgress } from '@mui/material';

interface CareerGoal {
    title: string;
    timeframe: string;
}

interface Competency {
    name: string;
    progress: number;
}

interface FocusArea {
    name: string;
    priority: number;
    progress: number;
    description: string;
}

interface ActionPlanItem {
    action?: string;
    description?: string;
    timeline?: string;
    successMetrics?: string;
    supportNeeded?: string;
}

interface ActionPlanObject {
    tasks?: { description: string }[];
    courses?: { name: string; duration: string; type: string }[];
    coaching?: { activity: string }[];
}

interface Course {
    name: string;
    progress: number;
}

interface Support {
    title: string;
    description: string;
}

interface GrowthMapData {
    careerGoal: CareerGoal;
    competencies: Competency[];
    focusAreas: FocusArea[];
    actionPlan: ActionPlanItem[] | ActionPlanObject;
    suggestedCourses: Course[];
    supportNeeded: Support[];
}

interface Props {
    data: GrowthMapData | null;
    loading?: boolean;
}

const CircularProgressWithLabel = ({ value, label, color = 'primary' }: { value: number; label: string; color?: string }) => {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <MuiCircularProgress
                    variant="determinate"
                    value={100}
                    size={120}
                    thickness={8}
                    sx={{ color: '#e0e0e0' }}
                />
                <MuiCircularProgress
                    variant="determinate"
                    value={value}
                    size={120}
                    thickness={8}
                    sx={{
                        color: color,
                        position: 'absolute',
                        left: 0,
                    }}
                />
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <Typography variant="h4" component="div" color="text.primary" sx={{ fontWeight: 700 }}>
                        {Math.round(value)}%
                    </Typography>
                </Box>
            </Box>
            <Typography variant="caption" sx={{ mt: 1, textAlign: 'center', fontWeight: 600, color: 'text.secondary' }}>
                {label}
            </Typography>
        </Box>
    );
};

export default function GrowthMapDashboard({ data, loading }: Props) {
    if (loading || !data) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <MuiCircularProgress />
            </Box>
        );
    }

    // Normalize actionPlan to array format
    const actionPlanItems: ActionPlanItem[] = Array.isArray(data.actionPlan)
        ? data.actionPlan
        : [
            ...((data.actionPlan as ActionPlanObject).tasks?.map(t => ({
                action: t.description,
                timeline: 'Ongoing',
                successMetrics: 'Complete task',
                supportNeeded: 'Team support'
            })) || []),
            ...((data.actionPlan as ActionPlanObject).courses?.map(c => ({
                action: `Complete ${c.name} course`,
                timeline: c.duration,
                successMetrics: 'Course completion',
                supportNeeded: 'Learning time'
            })) || []),
            ...((data.actionPlan as ActionPlanObject).coaching?.map(c => ({
                action: c.activity,
                timeline: 'Monthly',
                successMetrics: 'Regular participation',
                supportNeeded: 'Manager time'
            })) || [])
        ];

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.default', p: { xs: 2, md: 4 } }}>
            {/* Title */}
            <Typography
                variant="h3"
                sx={{
                    textAlign: 'center',
                    fontWeight: 700,
                    color: '#0f4c81',
                    mb: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                }}
            >
                GROWTH MAP
            </Typography>

            <Grid container spacing={3}>
                {/* Career Goal */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2, bgcolor: '#f5f7fa' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f4c81', mb: 2 }}>
                            CAREER GOAL
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                            {data.careerGoal.title} in {data.careerGoal.timeframe}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Competencies */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2, bgcolor: '#f5f7fa' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f4c81', mb: 2 }}>
                            COMPETENCIES
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {data.competencies.map((comp, idx) => (
                                <Box key={idx}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {comp.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                            {comp.progress}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={comp.progress}
                                        sx={{
                                            height: 8,
                                            borderRadius: 1,
                                            bgcolor: '#e0e0e0',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: '#5b7def',
                                                borderRadius: 1,
                                            },
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Focus Areas */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2, bgcolor: '#f5f7fa' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f4c81', mb: 2 }}>
                            FOCUS AREAS
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            {data.focusAreas.map((area, idx) => (
                                <CircularProgressWithLabel
                                    key={idx}
                                    value={area.progress}
                                    label={area.name}
                                    color={idx === 0 ? '#5b7def' : idx === 1 ? '#6a8ef5' : '#7aa0ff'}
                                />
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Suggested Courses */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2, bgcolor: '#f5f7fa' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f4c81', mb: 2 }}>
                            SUGGESTED COURSES
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {data.suggestedCourses.map((course, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label={`0${idx + 1}`}
                                        size="small"
                                        sx={{
                                            bgcolor: '#5b7def',
                                            color: 'white',
                                            fontWeight: 700,
                                            minWidth: 36,
                                        }}
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            {course.name}
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={course.progress}
                                            sx={{
                                                height: 6,
                                                borderRadius: 1,
                                                bgcolor: '#e0e0e0',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: '#5b7def',
                                                    borderRadius: 1,
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Action Plan */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: '#f5f7fa' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f4c81', mb: 2 }}>
                            ACTION PLAN
                        </Typography>
                        <Grid container spacing={2}>
                            {actionPlanItems.map((item, idx) => (
                                <Grid size={{ xs: 12 }} key={idx}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: 'white',
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <Chip
                                                icon={<span>⚡</span>}
                                                label={item.timeline}
                                                size="small"
                                                sx={{ bgcolor: '#e3f2fd' }}
                                            />
                                        </Box>
                                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                            • {item.action}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            <strong>Success Metrics:</strong> {item.successMetrics}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Support Needed:</strong> {item.supportNeeded}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Support Needed */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: '#f5f7fa' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f4c81', mb: 2 }}>
                            SUPPORT NEEDED
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {data.supportNeeded.map((support, idx) => (
                                <Box key={idx} sx={{ display: 'flex', gap: 1 }}>
                                    <Chip
                                        label={`0${idx + 1}`}
                                        size="small"
                                        sx={{
                                            bgcolor: '#5b7def',
                                            color: 'white',
                                            fontWeight: 700,
                                            minWidth: 36,
                                        }}
                                    />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {support.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {support.description}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

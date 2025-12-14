'use client';

import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Container, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import GrowthMapWizard from '@/components/career-plan/GrowthMapWizard';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

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
    const t = useTranslations();
    const [value, setValue] = useState(0);
    const [plans, setPlans] = useState<any[]>([]);
    const [teamPlans, setTeamPlans] = useState<any[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [openComment, setOpenComment] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentPlanId, setCommentPlanId] = useState<number | null>(null);
    const [statusPlanId, setStatusPlanId] = useState<number | null>(null);
    const [openEmployeeComment, setOpenEmployeeComment] = useState(false);
    const { user } = useAuth();
    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    useEffect(() => {
        if (value === 1) {
            fetchPlans();
        } else if (value === 2) {
            fetchTeamPlans();
        }
    }, [value]);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/career-plan/my-plans');
            // Handle wrapped response { data: [...] } from NestJS interceptor
            const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);
            // Add 'no' field for index
            const dataWithNo = rawData.map((item: any, index: number) => ({ ...item, no: index + 1 }));
            setPlans(dataWithNo);
        } catch (error) {
            console.error('Failed to fetch plans', error);
        }
    };

    const fetchTeamPlans = async () => {
        try {
            const res = await api.get('/career-plan/team-plans');
            const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);
            const dataWithNo = rawData.map((item: any, index: number) => ({ ...item, no: index + 1 }));
            setTeamPlans(dataWithNo);
        } catch (error) {
            console.error('Failed to fetch team plans', error);
        }
    };

    const handleOpenComment = (plan: any) => {
        setCommentPlanId(plan.id);
        const existingComment = plan.managerComments?.general || '';
        setCommentText(existingComment);
        setOpenComment(true);
    };

    const handleSaveComment = async () => {
        if (!commentPlanId) return;
        try {
            await api.post(`/career-plan/${commentPlanId}/comment`, { general: commentText });
            alert('Comment saved!');
            setOpenComment(false);
            fetchTeamPlans(); // Refresh list
        } catch (error) {
            console.error('Failed to save comment', error);
            alert('Failed to save comment');
        }
    };

    const handleStatusChange = async (planId: number, newStatus: string) => {
        try {
            await api.patch(`/career-plan/${planId}/status`, { status: newStatus });
            alert(`Status updated to ${newStatus}`);
            fetchPlans();
            fetchTeamPlans();
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    };

    const handleSaveEmployeeComment = async () => {
        if (!commentPlanId) return;
        try {
            await api.post(`/career-plan/${commentPlanId}/employee-comment`, { general: commentText });
            alert('Comment saved!');
            setOpenEmployeeComment(false);
            fetchPlans();
        } catch (error) {
            console.error('Failed to save comment', error);
            alert('Failed to save comment');
        }
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        if (newValue === 1 && plans.length === 0) {
            fetchPlans();
        }
    };

    // const handleViewPlan = (plan: any) => {
    //     const growthMapData = transformPlanToGrowthMap(plan);
    //     if (growthMapData) {
    //         setSelectedPlan(growthMapData);
    //         setDialogOpen(true);
    //     }
    // };

    // const handleCloseDialog = () => {
    //     setDialogOpen(false);
    //     setSelectedPlan(null);
    // };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'success';
            case 'SUBMITTED': return 'info';
            case 'DRAFT': return 'default';
            case 'BACK_TO_SUBMIT': return 'warning';
            default: return 'default';
        }
    };

    const handleView = (plan: any) => {
        setSelectedPlan(plan);
        setOpenDetail(true);
    };

    const handleClose = () => {
        setOpenDetail(false);
        setSelectedPlan(null);
    };

    const columns: GridColDef[] = [
        { field: 'no', headerName: t('History.no'), width: 70 },
        { field: 'userEmail', headerName: t('History.userEmail'), width: 200, valueGetter: (value: any, row: any) => row.user?.email || 'N/A' },
        { field: 'managerEmail', headerName: t('History.managerEmail'), width: 200, valueGetter: (value: any, row: any) => row.manager?.email || 'N/A' },
        { field: 'year', headerName: t('History.year'), width: 100 },
        {
            field: 'careerGoal',
            headerName: t('History.careerGoal'),
            width: 250,
            valueGetter: (value: any, row: any) => {
                if (row.targetLevel && typeof value === 'object' && value?.title) {
                    return `${row.targetLevel} - ${value.title}`;
                }
                return row.targetLevel ? `${row.targetLevel} - ${value?.substring ? value.substring(0, 30) : value}...` : value;
            }
        },
        { field: 'status', headerName: t('History.status'), width: 150 },
        {
            field: 'actions',
            headerName: t('History.actions'),
            width: 300,
            renderCell: (params) => (
                <Box>
                    <Button variant="outlined" size="small" onClick={() => handleView(params.row)} sx={{ mr: 1 }}>
                        {t('History.view')}
                    </Button>
                    {params.row.status === 'APPROVED' && (
                        <Button variant="contained" color="primary" size="small" onClick={() => handleStatusChange(params.row.id, 'IN_PROGRESS')} sx={{ mr: 1 }}>
                            Add to Plan
                        </Button>
                    )}
                    {params.row.status === 'IN_PROGRESS' && (
                        <Button variant="outlined" color="primary" size="small" onClick={() => {
                            setCommentPlanId(params.row.id);
                            setCommentText(params.row.employeeComments?.general || '');
                            setOpenEmployeeComment(true);
                        }}>
                            Comment
                        </Button>
                    )}
                </Box>
            ),
        },
    ];

    const teamColumns: GridColDef[] = [
        { field: 'no', headerName: t('History.no'), width: 70 },
        { field: 'userName', headerName: 'Employee Name', width: 200, valueGetter: (value: any, row: any) => row.user?.name || 'N/A' },
        { field: 'userEmail', headerName: 'Employee Email', width: 250, valueGetter: (value: any, row: any) => row.user?.email || 'N/A' },
        { field: 'year', headerName: t('History.year'), width: 100 },
        {
            field: 'careerGoal',
            headerName: t('History.careerGoal'),
            width: 250,
            valueGetter: (value: any, row: any) => {
                if (row.targetLevel && typeof value === 'object' && value?.title) {
                    return `${row.targetLevel} - ${value.title}`;
                }
                return row.targetLevel ? `${row.targetLevel} - ${value?.substring ? value.substring(0, 30) : value}...` : value;
            }
        },
        { field: 'status', headerName: t('History.status'), width: 150 },
        {
            field: 'actions',
            headerName: t('History.actions'),
            width: 400,
            renderCell: (params) => (
                <Box>
                    <Button variant="outlined" size="small" onClick={() => handleView(params.row)} sx={{ mr: 1 }}>
                        {t('History.view')}
                    </Button>
                    {params.row.status === 'SUBMITTED' && (
                        <Button variant="contained" color="success" size="small" onClick={() => handleStatusChange(params.row.id, 'APPROVED')} sx={{ mr: 1 }}>
                            Confirm
                        </Button>
                    )}
                    {params.row.status === 'IN_PROGRESS' && (
                        <>
                            <Button variant="outlined" color="info" size="small" onClick={() => handleView(params.row)} sx={{ mr: 1 }}>
                                Done
                            </Button>
                            <Button variant="contained" color="success" size="small" onClick={() => handleStatusChange(params.row.id, 'COMPLETED')}>
                                Completed
                            </Button>
                        </>
                    )}
                    <Button variant="text" size="small" onClick={() => handleOpenComment(params.row)}>
                        Manager Comment
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>{t('Common.careerPlan')}</Typography>
            <Paper sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="career plan tabs">
                        <Tab label={t('CareerPlan.result.title')} />
                        <Tab label={t('History.title')} />
                        <Tab label="Team Growth Map" />
                    </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <GrowthMapWizard />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <div style={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={plans}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 5 },
                                },
                            }}
                            pageSizeOptions={[5, 10]}
                            disableRowSelectionOnClick
                        />
                    </div>
                </CustomTabPanel >
                {isAdminOrManager && (
                    <CustomTabPanel value={value} index={2}>
                        <div style={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={teamPlans}
                                columns={teamColumns}
                                initialState={{
                                    pagination: {
                                        paginationModel: { page: 0, pageSize: 5 },
                                    },
                                }}
                                pageSizeOptions={[5, 10]}
                                disableRowSelectionOnClick
                            />
                        </div>
                    </CustomTabPanel>
                )
                }
            </Paper >

            <Dialog open={openDetail} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{t('History.title')} - {selectedPlan?.year}</DialogTitle>
                <DialogContent dividers>
                    {selectedPlan && (
                        <Box>
                            <Typography variant="h6" gutterBottom>{t('CareerPlan.result.careerGoal')}</Typography>
                            <Typography paragraph><strong>Level: </strong>{selectedPlan.targetLevel}</Typography>
                            {typeof selectedPlan.careerGoal === 'object' && selectedPlan.careerGoal?.title ? (
                                <>
                                    <Typography paragraph><strong>Goal: </strong>{selectedPlan.careerGoal.title}</Typography>
                                    <Typography paragraph><strong>Timeframe: </strong>{selectedPlan.careerGoal.timeframe}</Typography>
                                </>
                            ) : (
                                <Typography paragraph>{selectedPlan.careerGoal}</Typography>
                            )}

                            <Typography variant="h6" gutterBottom>{t('CareerPlan.result.currentCompetencies')}</Typography>
                            {Array.isArray(selectedPlan.currentCompetencies) ? (
                                selectedPlan.currentCompetencies.map((comp: any, idx: number) => (
                                    <Typography key={idx} paragraph>
                                        {comp.name} - {comp.progress}%
                                    </Typography>
                                ))
                            ) : (
                                <Typography paragraph>{selectedPlan.currentCompetencies}</Typography>
                            )}

                            <Typography variant="h6" gutterBottom>{t('CareerPlan.result.focusAreas')}</Typography>
                            {Array.isArray(selectedPlan.focusAreas) && selectedPlan.focusAreas.map((area: any, idx: number) => (
                                <Paper key={idx} variant="outlined" sx={{ p: 1, mb: 1 }}>
                                    <Typography variant="subtitle2">{area.name || area.area} (Priority: {area.priority})</Typography>
                                    <Typography variant="body2">{area.description || area.suggestion}</Typography>
                                </Paper>
                            ))}

                            {selectedPlan.suggestedCourses && Array.isArray(selectedPlan.suggestedCourses) && (
                                <>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Suggested Courses</Typography>
                                    {selectedPlan.suggestedCourses.map((course: any, idx: number) => (
                                        <Typography key={idx} paragraph>
                                            {course.name} - {course.progress}%
                                        </Typography>
                                    ))}
                                </>
                            )}

                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>{t('CareerPlan.result.actionPlan')}</Typography>
                            {Array.isArray(selectedPlan.actionPlan) && selectedPlan.actionPlan.map((action: any, idx: number) => (
                                <Paper key={idx} variant="outlined" sx={{ p: 1, mb: 1 }}>
                                    <Typography variant="subtitle2">{action.action} ({action.timeline})</Typography>
                                    <Typography variant="body2">Metrics: {action.successMetrics}</Typography>
                                    <Typography variant="body2">Support: {action.supportNeeded}</Typography>
                                </Paper>
                            ))}

                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>{t('CareerPlan.result.supportNeeded')}</Typography>
                            <ul>
                                {Array.isArray(selectedPlan.supportNeeded) && selectedPlan.supportNeeded.map((support: any, idx: number) => (
                                    <li key={idx}>
                                        {typeof support === 'string' ? support : (
                                            <>
                                                <strong>{support.title}</strong>: {support.description}
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            {/* Display Comments */}
                            {selectedPlan.managerComments?.general && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" color="primary">Manager Comment:</Typography>
                                    <Typography variant="body2">{selectedPlan.managerComments.general}</Typography>
                                </Box>
                            )}
                            {selectedPlan.employeeComments?.general && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" color="primary">Employee Comment:</Typography>
                                    <Typography variant="body2">{selectedPlan.employeeComments.general}</Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t('History.close')}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openComment} onClose={() => setOpenComment(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Manager Comment</DialogTitle>
                <DialogContent>
                    <textarea
                        style={{ width: '100%', height: '150px', marginTop: '10px', padding: '8px' }}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Enter your feedback..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenComment(false)}>Cancel</Button>
                    <Button onClick={handleSaveComment} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEmployeeComment} onClose={() => setOpenEmployeeComment(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Employee Comment</DialogTitle>
                <DialogContent>
                    <textarea
                        style={{ width: '100%', height: '150px', marginTop: '10px', padding: '8px' }}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Updates on your progress..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEmployeeComment(false)}>Cancel</Button>
                    <Button onClick={handleSaveEmployeeComment} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
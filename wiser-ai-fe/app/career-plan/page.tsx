'use client';

import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, Container, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Card, CardContent, CardActions, Chip, useTheme, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import GrowthMapWizard from '@/components/career-plan/GrowthMapWizard';
import GrowthMapDashboard from '@/components/career-plan/GrowthMapDashboard';
import { transformPlanToGrowthMap, GrowthMapData } from '@/lib/api/careerPlan';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import CommentIcon from '@mui/icons-material/Comment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { VisibilityOutlined } from '@mui/icons-material';

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
            <Box sx={{ p: 3 }}>
                {children}
            </Box>
        </div>
    );
}

export default function CareerPlanPage() {
    const t = useTranslations('CareerPlan');
    const tHistory = useTranslations('History');
    const tCommon = useTranslations('Common');
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
    const [editPlanData, setEditPlanData] = useState<any>(undefined);
    const { user } = useAuth();
    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';
    const [openVisualize, setOpenVisualize] = useState(false);
    const [visualizeData, setVisualizeData] = useState<any>(null);

    useEffect(() => {
        // Fetch plans initially or when tab changes if needed.
        // To keep data fresh but allow persistence, we might want to fetch on mount or specific actions.
        // For now, let's fetch on mount or when switching to the tab to ensure latest list, 
        // BUT for the Wizard (index 0), we don't want to re-render/reset it unnecessarily.
        // However, fetching lists (index 1 & 2) shouldn't affect Wizard state if it's just state updates.
        if (value === 1) {
            fetchPlans();
        } else if (value === 2) {
            fetchTeamPlans();
        }
    }, [value]);

    const handleVisualize = (plan: any) => {
        // Convert DB plan to GrowthMapDashboard data format
        const data = transformPlanToGrowthMap(plan);
        setVisualizeData(data);
        setOpenVisualize(true);
    };

    const fetchPlans = async () => {
        try {
            const res = await api.get('/career-plan/my-plans');
            // Handle wrapped response { data: [...] } from NestJS interceptor
            const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);
            // Add 'no' field for index
            const dataWithNo = rawData.map((item: any, index: number) => ({ ...item, no: index + 1 }));

            // Only update if data changed to avoid re-renders? 
            // setPlans will trigger re-render of DataGrid, not Wizard if they are siblings.
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

            if (openDetail) setOpenDetail(false);

            fetchPlans();
            fetchTeamPlans();
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    };

    const handleConfirm = async (planId: number) => {
        await handleStatusChange(planId, 'APPROVED');
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

    const handleEdit = (plan: any) => {
        setEditPlanData(plan);
        setValue(0); // Switch to Wizard tab
    };

    const formatCareerGoal = (row: any) => {
        const goalVal = row.careerGoal;
        let goalTitle = '';

        if (typeof goalVal === 'object' && goalVal !== null) {
            goalTitle = goalVal.title || '';
        } else {
            goalTitle = String(goalVal || '');
        }

        if (row.targetLevel) {
            return `${row.targetLevel} - ${goalTitle}`;
        }
        return goalTitle;
    };

    const columns: GridColDef[] = [
        { field: 'no', headerName: tHistory('no'), width: 70 },
        { field: 'year', headerName: tHistory('year'), width: 100 },
        {
            field: 'careerGoal',
            headerName: tHistory('careerGoal'),
            width: 250,
            valueGetter: (value: any, row: any) => formatCareerGoal(row)
        },
        { field: 'status', headerName: tHistory('status'), width: 150 },
        {
            field: 'actions',
            headerName: tHistory('actions'),
            width: 250,
            renderCell: (params) => (
                <Box>
                    <Tooltip title={tHistory('view')}>
                        <IconButton
                            color="primary"
                            onClick={() => handleView(params.row)}
                        >
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={tHistory('visualize')}>
                        <IconButton
                            color="secondary"
                            onClick={() => handleVisualize(params.row)}
                        >
                            <VisibilityOutlined />
                        </IconButton>
                    </Tooltip>
                    {params.row.status === 'SUBMITTED' && (
                        <Tooltip title={tHistory('edit')}>
                            <IconButton
                                color="secondary"
                                onClick={() => handleEdit(params.row)}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    {params.row.status === 'APPROVED' && (
                        <Tooltip title={tHistory('addToPlan')}>
                            <IconButton color="primary" onClick={() => handleStatusChange(params.row.id, 'IN_PROGRESS')}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    {params.row.status === 'IN_PROGRESS' && (
                        <Tooltip title={tHistory('comment')}>
                            <IconButton color="info" onClick={() => {
                                setCommentPlanId(params.row.id);
                                setCommentText(params.row.employeeComments?.general || '');
                                setOpenEmployeeComment(true);
                            }}>
                                <CommentIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            ),
        },
    ];

    const teamColumns: GridColDef[] = [
        { field: 'no', headerName: tHistory('no'), width: 70 },
        { field: 'userName', headerName: tHistory('employeeName'), width: 200, valueGetter: (value: any, row: any) => row.user?.name || 'N/A' },
        { field: 'userEmail', headerName: tHistory('employeeEmail'), width: 250, valueGetter: (value: any, row: any) => row.user?.email || 'N/A' },
        { field: 'year', headerName: tHistory('year'), width: 100 },
        {
            field: 'careerGoal',
            headerName: tHistory('careerGoal'),
            width: 250,
            valueGetter: (value: any, row: any) => formatCareerGoal(row)
        },
        { field: 'status', headerName: tHistory('status'), width: 120 },
        {
            field: 'actions',
            headerName: tHistory('actions'),
            width: 250,
            renderCell: (params) => (
                <Box>
                    <Tooltip title={tHistory('view')}>
                        <IconButton color="primary" onClick={() => handleView(params.row)}>
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={tHistory('visualize')}>
                        <IconButton color="secondary" onClick={() => handleVisualize(params.row)}>
                            <VisibilityOutlined />
                        </IconButton>
                    </Tooltip>
                    {params.row.status === 'SUBMITTED' && (
                        <Tooltip title={tHistory('confirm')}>
                            <IconButton color="success" onClick={() => handleStatusChange(params.row.id, 'APPROVED')}>
                                <CheckCircleIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title={tHistory('managerComment')}>
                        <IconButton color="info" onClick={() => handleOpenComment(params.row)}>
                            <CommentIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const renderMobileCard = (row: any, isTeamView: boolean) => (
        <Card key={row.id} sx={{ mb: 2, width: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="div">
                        {row.year}
                    </Typography>
                    <Chip
                        label={row.status}
                        color={
                            row.status === 'APPROVED' ? 'success' :
                                row.status === 'IN_PROGRESS' ? 'primary' :
                                    row.status === 'COMPLETED' ? 'success' : 'default'
                        }
                        size="small"
                    />
                </Box>
                {isTeamView && (
                    <Typography color="text.secondary" gutterBottom>
                        {row.user?.name || row.user?.email}
                    </Typography>
                )}
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Goal:</strong> {formatCareerGoal(row)}
                </Typography>
            </CardContent>
            <CardActions>
                <Tooltip title={tHistory('view')}>
                    <IconButton size="small" onClick={() => handleView(row)}>
                        <VisibilityIcon />
                    </IconButton>
                </Tooltip>

                {!isTeamView && row.status === 'SUBMITTED' && (
                    <Tooltip title={tHistory('edit')}>
                        <IconButton size="small" color="secondary" onClick={() => handleEdit(row)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                )}

                {!isTeamView && row.status === 'APPROVED' && (
                    <Tooltip title={tHistory('addToPlan')}>
                        <IconButton size="small" color="primary" onClick={() => handleStatusChange(row.id, 'IN_PROGRESS')}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                )}
                {!isTeamView && row.status === 'IN_PROGRESS' && (
                    <Tooltip title={tHistory('comment')}>
                        <IconButton size="small" color="primary" onClick={() => {
                            setCommentPlanId(row.id);
                            setCommentText(row.employeeComments?.general || '');
                            setOpenEmployeeComment(true);
                        }}>
                            <CommentIcon />
                        </IconButton>
                    </Tooltip>
                )}


                {isTeamView && row.status === 'SUBMITTED' && (
                    <Tooltip title={tHistory('confirm')}>
                        <IconButton size="small" color="success" onClick={() => handleStatusChange(row.id, 'APPROVED')}>
                            <CheckCircleIcon />
                        </IconButton>
                    </Tooltip>
                )}
                {isTeamView && (
                    <Tooltip title={tHistory('managerComment')}>
                        <IconButton size="small" onClick={() => handleOpenComment(row)}>
                            <CommentIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </CardActions>
        </Card>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: isMobile ? 1 : 3 }}>
            <Typography variant="h4" gutterBottom>{tCommon('careerPlan')}</Typography>
            <Paper sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label="career plan tabs"
                        variant={isMobile ? "scrollable" : "standard"}
                        scrollButtons="auto"
                    >
                        <Tab label={t('result.title')} />
                        <Tab label={tHistory('title')} />
                        {isAdminOrManager && (<Tab label={tHistory('teamGrowthMap')} />)}
                    </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <GrowthMapWizard
                        initialData={editPlanData}
                        onSuccess={() => {
                            setEditPlanData(undefined);
                            // Optionally refresh history if needed, but not strictly required as we switch tabs manually
                        }}
                    />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    {isMobile ? (
                        <Box>
                            {plans.map((plan) => renderMobileCard(plan, false))}
                            {plans.length === 0 && <Typography sx={{ p: 2, textAlign: 'center' }}>{tHistory('noPlansFound')}</Typography>}
                        </Box>
                    ) : (
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
                    )}
                </CustomTabPanel>
                {isAdminOrManager && (
                    <CustomTabPanel value={value} index={2}>
                        {isMobile ? (
                            <Box>
                                {teamPlans.map((plan) => renderMobileCard(plan, true))}
                                {teamPlans.length === 0 && <Typography sx={{ p: 2, textAlign: 'center' }}>{tHistory('noTeamPlansFound')}</Typography>}
                            </Box>
                        ) : (
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
                        )}
                    </CustomTabPanel>
                )
                }
            </Paper >

            <Dialog open={openDetail} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{tHistory('title')} - {selectedPlan?.year}</DialogTitle>
                <DialogContent dividers>
                    {selectedPlan && (
                        <Box>
                            <Typography variant="h6" gutterBottom>{t('result.careerGoal')}</Typography>
                            <Typography paragraph><strong>{tHistory('level')}: </strong>{selectedPlan.targetLevel}</Typography>
                            {typeof selectedPlan.careerGoal === 'object' && selectedPlan.careerGoal?.title ? (
                                <>
                                    <Typography paragraph><strong>{tHistory('goal')}: </strong>{selectedPlan.careerGoal.title}</Typography>
                                    <Typography paragraph><strong>{tHistory('timeframe')}: </strong>{selectedPlan.careerGoal.timeframe}</Typography>
                                </>
                            ) : (
                                <Typography paragraph>{selectedPlan.careerGoal}</Typography>
                            )}

                            <Typography variant="h6" gutterBottom>{t('result.currentCompetencies')}</Typography>
                            {Array.isArray(selectedPlan.currentCompetencies) ? (
                                selectedPlan.currentCompetencies.map((comp: any, idx: number) => (
                                    <Typography key={idx} paragraph>
                                        {comp.name} - {comp.progress}%
                                    </Typography>
                                ))
                            ) : (
                                <Typography paragraph>{selectedPlan.currentCompetencies}</Typography>
                            )}

                            <Typography variant="h6" gutterBottom>{t('result.focusAreas')}</Typography>
                            {Array.isArray(selectedPlan.focusAreas) && selectedPlan.focusAreas.map((area: any, idx: number) => (
                                <Paper key={idx} variant="outlined" sx={{ p: 1, mb: 1 }}>
                                    <Typography variant="subtitle2">{area.name || area.area} ({tHistory('priority')}: {area.priority})</Typography>
                                    <Typography variant="body2">{area.description || area.suggestion}</Typography>
                                </Paper>
                            ))}

                            {selectedPlan.suggestedCourses && Array.isArray(selectedPlan.suggestedCourses) && (
                                <>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>{tHistory('suggestedCourses')}</Typography>
                                    {selectedPlan.suggestedCourses.map((course: any, idx: number) => (
                                        <Typography key={idx} paragraph>
                                            {course.name} - {course.progress}%
                                        </Typography>
                                    ))}
                                </>
                            )}

                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>{t('result.actionPlan')}</Typography>
                            {Array.isArray(selectedPlan.actionPlan) && selectedPlan.actionPlan.map((action: any, idx: number) => (
                                <Paper key={idx} variant="outlined" sx={{ p: 1, mb: 1 }}>
                                    <Typography variant="subtitle2">{action.action} ({action.timeline})</Typography>
                                    <Typography variant="body2">{tHistory('metrics')}: {action.successMetrics}</Typography>
                                    <Typography variant="body2">{tHistory('support')}: {action.supportNeeded}</Typography>
                                </Paper>
                            ))}

                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>{t('result.supportNeeded')}</Typography>
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
                                    <Typography variant="subtitle2" color="primary">{tHistory('managerCommentLabel')}</Typography>
                                    <Typography variant="body2">{selectedPlan.managerComments.general}</Typography>
                                </Box>
                            )}
                            {selectedPlan.employeeComments?.general && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" color="primary">{tHistory('employeeCommentLabel')}</Typography>
                                    <Typography variant="body2">{selectedPlan.employeeComments.general}</Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {isAdminOrManager && selectedPlan?.status === 'IN_PROGRESS' && (
                        <Button variant="contained" color="success" onClick={() => handleStatusChange(selectedPlan.id, 'COMPLETED')}>
                            {tHistory('completed')}
                        </Button>
                    )}
                    <Button onClick={handleClose}>{tHistory('close')}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openComment} onClose={() => setOpenComment(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{tHistory('managerComment')}</DialogTitle>
                <DialogContent>
                    <textarea
                        style={{ width: '100%', height: '150px', marginTop: '10px', padding: '8px' }}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={tHistory('enterFeedback')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenComment(false)}>{tHistory('cancel')}</Button>
                    <Button onClick={handleSaveComment} variant="contained">{tHistory('save')}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEmployeeComment} onClose={() => setOpenEmployeeComment(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{tHistory('employeeCommentLabel')}</DialogTitle>
                <DialogContent>
                    <textarea
                        style={{ width: '100%', height: '150px', marginTop: '10px', padding: '8px' }}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={tHistory('updatesOnProgress')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEmployeeComment(false)}>{tHistory('cancel')}</Button>
                    <Button onClick={handleSaveEmployeeComment} variant="contained">{tHistory('save')}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openVisualize} onClose={() => setOpenVisualize(false)} maxWidth="lg" fullWidth>
                <DialogTitle>{tHistory('growthMapVisualization')}</DialogTitle>
                <DialogContent dividers>
                    {visualizeData && (
                        <GrowthMapDashboard data={visualizeData} loading={false} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenVisualize(false)}>{tHistory('close')}</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
'use client';

import React, { useState } from 'react';
import {
    Box, Stepper, Step, StepLabel, Button, Typography, Paper,
    Container, TextField, RadioGroup, FormControlLabel, Radio,
    CircularProgress
} from '@mui/material';
import { useTranslations } from 'next-intl';
import {
    CareerPlanData, ReviewPeriod, UserLevel,
    CareerGoal, Competency, FocusArea, ActionPlanItem, SuggestedCourse, SupportNeededItem
} from '@/types/career-plan';
import api from '@/utils/api';

const steps = ['reviewPeriod', 'objectives', 'achievements', 'improvements', 'expectations', 'review'];

export default function GrowthMapWizard() {
    const t = useTranslations('CareerPlan');
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CareerPlanData>({
        targetLevel: UserLevel.JUNIOR,
        reviewPeriod: ReviewPeriod.SIX_MONTHS,
        objectives: '',
        achievements: '',
        certificates: [],
        improvements: '',
        expectations: ''
    });
    const [generatedResult, setGeneratedResult] = useState<any>(null);

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            // Generate Growth Map
            await generateMap();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const generateMap = async () => {
        setLoading(true);
        try {
            const res = await api.post('/career-plan/generate-growth-map', formData);
            const mapData = res.data.data || res.data; // Handle wrapped or direct response

            setFormData(prev => ({
                ...prev,
                careerGoal: mapData.careerGoal,
                currentCompetencies: mapData.competencies, // Map API 'competencies' to 'currentCompetencies'
                focusAreas: mapData.focusAreas || [],
                actionPlan: mapData.actionPlan || [],
                suggestedCourses: mapData.suggestedCourses || [],
                supportNeeded: mapData.supportNeeded || []
            }));
            setGeneratedResult(true); // Logic flag to show result view
        } catch (error) {
            console.error(error);
            alert('Failed to generate map');
        } finally {
            setLoading(false);
        }
    };

    const handleTextChange = (field: keyof CareerPlanData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const res = await api.post('/career-plan/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newCert = {
                name: file.name,
                level: 'Intermediate', // Default/Mock
                fileUrl: res.data.url
            };

            setFormData(prev => ({
                ...prev,
                certificates: [...prev.certificates, newCert]
            }));
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed');
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>{t('form.selectCareerGoal')}</Typography>
                        <RadioGroup
                            row
                            value={formData.targetLevel}
                            onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value as UserLevel })}
                            sx={{ mb: 3 }}
                        >
                            <FormControlLabel value={UserLevel.FRESHER} control={<Radio />} label="Fresher" />
                            <FormControlLabel value={UserLevel.JUNIOR} control={<Radio />} label="Junior" />
                            <FormControlLabel value={UserLevel.SENIOR} control={<Radio />} label="Senior" />
                            <FormControlLabel value={UserLevel.PRINCIPAL} control={<Radio />} label="Principal" />
                        </RadioGroup>

                        <Typography variant="h6" gutterBottom>{t('form.selectReviewPeriod')}</Typography>
                        <RadioGroup
                            row
                            value={formData.reviewPeriod}
                            onChange={(e) => setFormData({ ...formData, reviewPeriod: e.target.value as ReviewPeriod })}
                        >
                            <FormControlLabel value={ReviewPeriod.SIX_MONTHS} control={<Radio />} label={t('form.sixMonths')} />
                            <FormControlLabel value={ReviewPeriod.TWELVE_MONTHS} control={<Radio />} label={t('form.twelveMonths')} />
                        </RadioGroup>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>{t('form.objectives')}</Typography>
                        <TextField
                            fullWidth multiline rows={4}
                            value={formData.objectives}
                            onChange={handleTextChange('objectives')}
                            placeholder={t('form.enterObjectives')}
                        />
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>{t('form.achievements')}</Typography>
                        <TextField
                            fullWidth multiline rows={4}
                            value={formData.achievements}
                            onChange={handleTextChange('achievements')}
                            placeholder={t('form.describeAchievements')}
                            sx={{ mb: 2 }}
                        />

                        <Typography variant="h6" gutterBottom>{t('form.certificates')}</Typography>
                        <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                            {t('form.uploadCertificate')}
                            <input type="file" hidden onChange={handleFileUpload} />
                        </Button>

                        {formData.certificates.map((cert, index) => (
                            <Paper key={index} sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center' }}>
                                <Typography sx={{ flexGrow: 1 }}>{cert.name} ({cert.level})</Typography>
                                {cert.fileUrl && <Typography variant="caption" color="success.main">{t('form.uploaded')}</Typography>}
                            </Paper>
                        ))}
                    </Box>
                );
            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>{t('form.improvements')}</Typography>
                        <TextField
                            fullWidth multiline rows={4}
                            value={formData.improvements}
                            onChange={handleTextChange('improvements')}
                            placeholder={t('form.areasForImprovement')}
                        />
                    </Box>
                );
            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>{t('form.expectations')}</Typography>
                        <TextField
                            fullWidth multiline rows={4}
                            value={formData.expectations}
                            onChange={handleTextChange('expectations')}
                            placeholder={t('form.yourExpectations')}
                        />
                    </Box>
                );
            case 5:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>{t('form.reviewAndGenerate')}</Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>{t('form.careerGoalLabel') || 'Career Goal'}</Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>{formData.targetLevel}</Typography>

                            <Typography variant="subtitle2" gutterBottom>{t('form.reviewPeriodLabel')}</Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>{formData.reviewPeriod === ReviewPeriod.SIX_MONTHS ? t('form.sixMonths') : t('form.twelveMonths')}</Typography>

                            <Typography variant="subtitle2" gutterBottom>{t('form.objectivesLabel')}</Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>{formData.objectives || 'N/A'}</Typography>

                            <Typography variant="subtitle2" gutterBottom>{t('form.achievementsLabel')}</Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>{formData.achievements || 'N/A'}</Typography>

                            <Typography variant="subtitle2" gutterBottom>{t('form.certificatesLabel')} ({formData.certificates.length})</Typography>
                            <Box sx={{ mb: 2 }}>
                                {formData.certificates.length > 0 ? (
                                    formData.certificates.map((c, i) => (
                                        <Typography key={i} variant="body2">• {c.name}</Typography>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">{t('form.noCertificates')}</Typography>
                                )}
                            </Box>

                            <Typography variant="subtitle2" gutterBottom>{t('form.improvementsLabel')}</Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>{formData.improvements || 'N/A'}</Typography>

                            <Typography variant="subtitle2" gutterBottom>{t('form.expectationsLabel')}</Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>{formData.expectations || 'N/A'}</Typography>
                        </Paper>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };
    const submitPlan = async () => {
        setLoading(true);
        try {
            // Merge input data with generated result
            const payload: any = { // Relax type check for extra props if any, or strict match
                ...formData,
                year: new Date().getFullYear(),
                status: 'SUBMITTED'
            };

            await api.post('/career-plan', payload);
            alert('Growth Map Submitted successfully!');
            setGeneratedResult(null);
            setActiveStep(0);
            setFormData({
                targetLevel: UserLevel.JUNIOR,
                reviewPeriod: ReviewPeriod.SIX_MONTHS,
                objectives: '',
                achievements: '',
                certificates: [],
                improvements: '',
                expectations: ''
            });
        } catch (error) {
            console.error(error);
            alert('Failed to submit plan');
        } finally {
            setLoading(false);
        }
    };

    if (generatedResult) {
        return (
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" color="primary" gutterBottom>{t('result.title')}</Typography>

                {/* Input Summary Section */}
                <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>Your Inputs</Typography>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Review Period</Typography>
                        <Typography variant="body2">{formData.reviewPeriod === ReviewPeriod.SIX_MONTHS ? t('form.sixMonths') : t('form.twelveMonths')}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Objectives</Typography>
                        <Typography variant="body2">{formData.objectives || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Achievements</Typography>
                        <Typography variant="body2">{formData.achievements || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Certificates</Typography>
                        {formData.certificates.length > 0 ? (
                            formData.certificates.map((c, i) => (
                                <Typography key={i} variant="caption" display="block">• {c.name}</Typography>
                            ))
                        ) : (
                            <Typography variant="caption" color="text.secondary">None</Typography>
                        )}
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Improvements</Typography>
                        <Typography variant="body2">{formData.improvements || 'N/A'}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2">Expectations</Typography>
                        <Typography variant="body2">{formData.expectations || 'N/A'}</Typography>
                    </Box>
                </Paper>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">{t('result.careerGoal')}</Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={formData.careerGoal?.title || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                careerGoal: { ...formData.careerGoal!, title: e.target.value }
                            })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Timeframe"
                            value={formData.careerGoal?.timeframe || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                careerGoal: { ...formData.careerGoal!, timeframe: e.target.value }
                            })}
                        />
                    </Paper>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">{t('result.currentCompetencies')}</Typography>
                    {formData.currentCompetencies?.map((comp, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={comp.name}
                                onChange={(e) => {
                                    const newComps = [...(formData.currentCompetencies || [])];
                                    newComps[idx].name = e.target.value;
                                    setFormData({ ...formData, currentCompetencies: newComps });
                                }}
                            />
                            <TextField
                                type="number"
                                label="Progress %"
                                value={comp.progress}
                                onChange={(e) => {
                                    const newComps = [...(formData.currentCompetencies || [])];
                                    newComps[idx].progress = Number(e.target.value);
                                    setFormData({ ...formData, currentCompetencies: newComps });
                                }}
                                sx={{ width: 100 }}
                            />
                            <Button
                                color="error"
                                onClick={() => {
                                    const newComps = (formData.currentCompetencies || []).filter((_, i) => i !== idx);
                                    setFormData({ ...formData, currentCompetencies: newComps });
                                }}
                            >
                                X
                            </Button>
                        </Box>
                    ))}
                    <Button onClick={() => setFormData({
                        ...formData,
                        currentCompetencies: [...(formData.currentCompetencies || []), { name: '', progress: 0 }]
                    })}>
                        Add Competency
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">{t('result.focusAreas')}</Typography>
                    {formData.focusAreas?.map((area, idx) => (
                        <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Area Name"
                                    value={area.name}
                                    onChange={(e) => {
                                        const newAreas = [...(formData.focusAreas || [])];
                                        newAreas[idx].name = e.target.value;
                                        setFormData({ ...formData, focusAreas: newAreas });
                                    }}
                                />
                                {/* <TextField
                                    type="number"
                                    label="Priority"
                                    value={area.priority}
                                    onChange={(e) => {
                                        const newAreas = [...(formData.focusAreas || [])];
                                        newAreas[idx].priority = Number(e.target.value);
                                        setFormData({ ...formData, focusAreas: newAreas });
                                    }}
                                    sx={{ width: 100 }}
                                /> */}
                                <TextField
                                    type="number"
                                    label="Progress %"
                                    value={area.progress}
                                    onChange={(e) => {
                                        const newAreas = [...(formData.focusAreas || [])];
                                        newAreas[idx].progress = Number(e.target.value);
                                        setFormData({ ...formData, focusAreas: newAreas });
                                    }}
                                    sx={{ width: 100 }}
                                />
                            </Box>
                            <TextField
                                fullWidth multiline
                                label="Description"
                                value={area.description}
                                onChange={(e) => {
                                    const newAreas = [...(formData.focusAreas || [])];
                                    newAreas[idx].description = e.target.value;
                                    setFormData({ ...formData, focusAreas: newAreas });
                                }}
                            />
                            <Button
                                color="error" size="small" sx={{ mt: 1 }}
                                onClick={() => {
                                    const newAreas = (formData.focusAreas || []).filter((_, i) => i !== idx);
                                    setFormData({ ...formData, focusAreas: newAreas });
                                }}
                            >
                                Remove
                            </Button>
                        </Paper>
                    ))}
                    <Button onClick={() => setFormData({
                        ...formData,
                        focusAreas: [...(formData.focusAreas || []), { name: '', priority: 0, progress: 0, description: '' }]
                    })}>
                        Add Focus Area
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">{t('result.actionPlan')}</Typography>
                    {formData.actionPlan?.map((action, idx) => (
                        <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <TextField
                                fullWidth multiline
                                label="Action"
                                value={action.action}
                                onChange={(e) => {
                                    const newPlan = [...(formData.actionPlan || [])];
                                    newPlan[idx].action = e.target.value;
                                    setFormData({ ...formData, actionPlan: newPlan });
                                }}
                                sx={{ mb: 2 }}
                            />
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Timeline"
                                    value={action.timeline}
                                    onChange={(e) => {
                                        const newPlan = [...(formData.actionPlan || [])];
                                        newPlan[idx].timeline = e.target.value;
                                        setFormData({ ...formData, actionPlan: newPlan });
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Support Needed"
                                    value={action.supportNeeded}
                                    onChange={(e) => {
                                        const newPlan = [...(formData.actionPlan || [])];
                                        newPlan[idx].supportNeeded = e.target.value;
                                        setFormData({ ...formData, actionPlan: newPlan });
                                    }}
                                />
                            </Box>
                            <TextField
                                fullWidth multiline
                                label="Success Metrics"
                                value={action.successMetrics}
                                onChange={(e) => {
                                    const newPlan = [...(formData.actionPlan || [])];
                                    newPlan[idx].successMetrics = e.target.value;
                                    setFormData({ ...formData, actionPlan: newPlan });
                                }}
                            />
                            <Button
                                color="error" size="small" sx={{ mt: 1 }}
                                onClick={() => {
                                    const newPlan = (formData.actionPlan || []).filter((_, i) => i !== idx);
                                    setFormData({ ...formData, actionPlan: newPlan });
                                }}
                            >
                                Remove
                            </Button>
                        </Paper>
                    ))}
                    <Button onClick={() => setFormData({
                        ...formData,
                        actionPlan: [...(formData.actionPlan || []), { action: '', timeline: '', successMetrics: '', supportNeeded: '' }]
                    })}>
                        Add Action
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">Suggested Courses</Typography>
                    {formData.suggestedCourses?.map((course, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                label="Course Name"
                                value={course.name}
                                onChange={(e) => {
                                    const newCourses = [...(formData.suggestedCourses || [])];
                                    newCourses[idx].name = e.target.value;
                                    setFormData({ ...formData, suggestedCourses: newCourses });
                                }}
                            />
                            <TextField
                                type="number"
                                label="Progress %"
                                value={course.progress}
                                onChange={(e) => {
                                    const newCourses = [...(formData.suggestedCourses || [])];
                                    newCourses[idx].progress = Number(e.target.value);
                                    setFormData({ ...formData, suggestedCourses: newCourses });
                                }}
                                sx={{ width: 100 }}
                            />
                            <Button
                                color="error"
                                onClick={() => {
                                    const newCourses = (formData.suggestedCourses || []).filter((_, i) => i !== idx);
                                    setFormData({ ...formData, suggestedCourses: newCourses });
                                }}
                            >
                                X
                            </Button>
                        </Box>
                    ))}
                    <Button onClick={() => setFormData({
                        ...formData,
                        suggestedCourses: [...(formData.suggestedCourses || []), { name: '', progress: 0 }]
                    })}>
                        Add Course
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">{t('result.supportNeeded')}</Typography>
                    {formData.supportNeeded?.map((support, idx) => (
                        <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={support.title}
                                onChange={(e) => {
                                    const newSupport = [...(formData.supportNeeded || [])];
                                    newSupport[idx].title = e.target.value;
                                    setFormData({ ...formData, supportNeeded: newSupport });
                                }}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth multiline
                                label="Description"
                                value={support.description}
                                onChange={(e) => {
                                    const newSupport = [...(formData.supportNeeded || [])];
                                    newSupport[idx].description = e.target.value;
                                    setFormData({ ...formData, supportNeeded: newSupport });
                                }}
                            />
                            <Button
                                color="error" size="small" sx={{ mt: 1 }}
                                onClick={() => {
                                    const newSupport = (formData.supportNeeded || []).filter((_, i) => i !== idx);
                                    setFormData({ ...formData, supportNeeded: newSupport });
                                }}
                            >
                                Remove
                            </Button>
                        </Paper>
                    ))}
                    <Button onClick={() => setFormData({
                        ...formData,
                        supportNeeded: [...(formData.supportNeeded || []), { title: '', description: '' }]
                    })}>
                        Add Support Item
                    </Button>
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mt: 2 }}
                    onClick={submitPlan}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : t('buttons.submit')}
                </Button>
            </Paper>
        )
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{t(`steps.${label}`)}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Box sx={{ mt: 4, mb: 4, minHeight: '200px' }}>
                {renderStepContent(activeStep)}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                    color="inherit"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                >
                    {t('buttons.back')}
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={handleNext} variant="contained">
                    {activeStep === steps.length - 1 ? (loading ? <CircularProgress size={24} /> : t('buttons.generate')) : t('buttons.next')}
                </Button>
            </Box>
        </Box>
    );
}

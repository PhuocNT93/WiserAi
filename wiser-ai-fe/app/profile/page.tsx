'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { useTranslations } from 'next-intl';

export default function ProfilePage() {
    const t = useTranslations('Dashboard');

    return (
        <Box>
            {/* Header Section */}
            <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 80, height: 80 }} src="/static/images/avatar/1.jpg" />
                <Box>
                    <Typography variant="h4">Logan McNeil</Typography>
                    <Typography variant="subtitle1" color="text.secondary">Human Resources Service Partner</Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                        <Chip label="Chicago" size="small" />
                        <Chip label="Human Resources" size="small" />
                    </Stack>
                </Box>
            </Paper>

            <Grid container spacing={3}>
                {/* Left Column - Summary / Quick Actions */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>{t('summary')}</Typography>
                            <Button fullWidth variant="outlined" sx={{ mb: 1 }}>{t('jobDetails')}</Button>
                            <Button fullWidth variant="outlined" sx={{ mb: 1 }}>{t('personalInfo')}</Button>
                            <Button fullWidth variant="outlined">{t('contact')}</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>{t('manager')}</Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar>JS</Avatar>
                                <Box>
                                    <Typography variant="body1">Joy Song</Typography>
                                    <Typography variant="caption">{t('manager')}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Main Content Cards */}
                <Grid size={{ xs: 12, md: 9 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>{t('jobDetails')}</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">{t('employeeId')}</Typography>
                                            <Typography>21557</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">{t('position')}</Typography>
                                            <Typography>Human Resources Service Partner</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">{t('timeType')}</Typography>
                                            <Typography>Full time</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">{t('location')}</Typography>
                                            <Typography>Chicago (Logan McNeil)</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>{t('statements')}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('noStatements')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Note: In previous version it was "Grid item xs={12}", checked Grid2 usage */}
                        <Grid size={{ xs: 12 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>{t('jobHistory')}</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box>
                                            <Typography variant="subtitle2">Human Resources Service Partner</Typography>
                                            <Typography variant="caption" color="text.secondary">Human Resources Service Partner (Joy Song) | 01/01/2019 - Present</Typography>
                                        </Box>
                                        <Divider />
                                        <Box>
                                            <Typography variant="subtitle2">HR Generalist</Typography>
                                            <Typography variant="caption" color="text.secondary">Global Modern Services | 02/10/2014 - 12/31/2018</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

function Divider() { return <Box sx={{ height: 1, bgcolor: 'divider', my: 1 }} /> }

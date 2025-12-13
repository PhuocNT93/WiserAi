'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUserSkills, createUserSkill, updateUserSkill, deleteUserSkill } from '../../lib/api/userSkills';

interface SkillData {
    id: number;
    name: string;
    level: number;
}

interface ProfileData {
    fullName: string;
    email: string;
    employeeCode: string;
    businessUnit: string;
    jobTitle: string;
    leader: string;
    manager: string;
}

export default function SummaryPage() {
    // All user's skills
    const [allSkills, setAllSkills] = React.useState<SkillData[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Pinned skills (top 4, set on load/refresh)
    const [pinnedSkillIds, setPinnedSkillIds] = React.useState<number[]>([]);

    const [mySkillsOpen, setMySkillsOpen] = React.useState(false);
    const [newSkillName, setNewSkillName] = React.useState('');
    const [newSkillLevel, setNewSkillLevel] = React.useState(50);
    const [editingSkillId, setEditingSkillId] = React.useState<number | null>(null);
    const [tempSkillLevels, setTempSkillLevels] = React.useState<Record<number, number>>({});

    // Toast notification state
    const [toastOpen, setToastOpen] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState('');

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
    const [skillToDelete, setSkillToDelete] = React.useState<number | null>(null);

    // Debounce timer for auto-save
    const saveTimerRef = React.useRef<Record<number, NodeJS.Timeout>>({});

    const profileData: ProfileData = {
        fullName: 'Logan McNeil',
        email: 'logan.mcneil@example.com',
        employeeCode: '21557',
        businessUnit: 'Human Resources',
        jobTitle: 'Human Resources Service Partner',
        leader: 'Joy Song',
        manager: 'Joy Song'
    };

    // Load skills from API on mount
    React.useEffect(() => {
        loadSkills();

        // Cleanup function to clear all timers on unmount
        return () => {
            Object.values(saveTimerRef.current).forEach(timer => clearTimeout(timer));
        };
    }, []);

    // Initialize pinned skills only on first load
    React.useEffect(() => {
        if (allSkills.length > 0 && pinnedSkillIds.length === 0) {
            const top4Ids = [...allSkills]
                .sort((a, b) => b.level - a.level)
                .slice(0, 4)
                .map(s => s.id);
            setPinnedSkillIds(top4Ids);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allSkills.length]);

    const loadSkills = async () => {
        try {
            setLoading(true);
            setError(null);
            const skills = await getUserSkills();
            // Map backend UserSkill to frontend SkillData
            const mappedSkills: SkillData[] = skills.map(skill => ({
                id: skill.id,
                name: skill.skillName,
                level: skill.level ? parseInt(skill.level) : 50
            }));
            setAllSkills(mappedSkills);
        } catch (err) {
            console.error('Failed to load skills:', err);
            setError('Failed to load skills. Please try again.');
            showToast('Failed to load skills', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Get pinned skills to display
    const displayedSkills = React.useMemo(() => {
        return pinnedSkillIds
            .map(id => allSkills.find(s => s.id === id))
            .filter(Boolean) as SkillData[];
    }, [pinnedSkillIds, allSkills]);

    // Skills not currently pinned (for Add Skill modal)
    const unpinnedSkills = React.useMemo(() => {
        return allSkills.filter(skill => !pinnedSkillIds.includes(skill.id));
    }, [allSkills, pinnedSkillIds]);

    // Calculate stats based on ALL skills
    const stats = React.useMemo(() => {
        const avgProficiency = allSkills.length > 0
            ? Math.round(allSkills.reduce((acc, skill) => acc + skill.level, 0) / allSkills.length)
            : 0;
        const strongSkills = allSkills.filter(s => s.level >= 70).length;
        const topSkillLevel = allSkills.length > 0
            ? Math.max(...allSkills.map(s => s.level))
            : 0;

        return {
            coreSkills: allSkills.length,
            avgProficiency,
            strongSkills,
            topSkillLevel
        };
    }, [allSkills]);

    const [toastSeverity, setToastSeverity] = React.useState<'success' | 'error'>('success');

    const showToast = (message: string, severity: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastSeverity(severity);
        setToastOpen(true);
    };

    const handleCloseToast = () => {
        setToastOpen(false);
    };

    const handleSkillChange = async (id: number, newValue: number | number[]) => {
        const newLevel = newValue as number;
        const skill = allSkills.find(s => s.id === id);

        // Optimistically update UI immediately
        setAllSkills(prevSkills =>
            prevSkills.map(skill =>
                skill.id === id ? { ...skill, level: newLevel } : skill
            )
        );

        // Clear any existing timer for this skill
        if (saveTimerRef.current[id]) {
            clearTimeout(saveTimerRef.current[id]);
        }

        // Set new timer to auto-save after 1.5 seconds
        saveTimerRef.current[id] = setTimeout(async () => {
            try {
                await updateUserSkill(id, { level: `${newLevel}` });
                if (skill) {
                    showToast(`"${skill.name}" updated to ${newLevel}%!`, 'success');
                }
            } catch (err) {
                console.error('Failed to update skill level:', err);
                showToast('Failed to update skill level', 'error');
                // Reload skills to ensure consistency
                loadSkills();
            } finally {
                // Clean up the timer reference
                delete saveTimerRef.current[id];
            }
        }, 1500); // 1.5 seconds debounce
    };

    const handlePinExistingSkill = (skillToPin: SkillData) => {
        if (pinnedSkillIds.length >= 4) {
            alert('You can only pin up to 4 skills. Please remove one first.');
            return;
        }
        if (!pinnedSkillIds.includes(skillToPin.id)) {
            setPinnedSkillIds(prev => [...prev, skillToPin.id]);
            showToast(`"${skillToPin.name}" pinned successfully!`);
        }
        setMySkillsOpen(false);
    };

    const handleCreateAndPinNewSkill = async () => {
        if (!newSkillName.trim()) {
            alert('Please enter a skill name');
            return;
        }

        try {
            const createdSkill = await createUserSkill({
                skillName: newSkillName.trim(),
                level: `${newSkillLevel}`
            });

            // Add to all skills
            const newSkill: SkillData = {
                id: createdSkill.id,
                name: createdSkill.skillName,
                level: createdSkill.level ? parseInt(createdSkill.level) : newSkillLevel
            };
            setAllSkills(prev => [...prev, newSkill]);

            // Reset form but keep modal open
            setNewSkillName('');
            setNewSkillLevel(50);

            showToast(`Skill "${newSkill.name}" created successfully!`);
        } catch (err) {
            console.error('Failed to create skill:', err);
            showToast('Failed to create skill. Please try again.', 'error');
        }
    };

    const handleUnpinSkill = (id: number) => {
        const skill = allSkills.find(s => s.id === id);
        setPinnedSkillIds(prev => prev.filter(skillId => skillId !== id));
        if (skill) {
            showToast(`"${skill.name}" unpinned successfully!`);
        }
    };

    const handleDeleteSkill = (id: number) => {
        setSkillToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteSkill = async () => {
        if (skillToDelete === null) return;

        const skill = allSkills.find(s => s.id === skillToDelete);
        try {
            await deleteUserSkill(skillToDelete);
            // Remove from all skills
            setAllSkills(prev => prev.filter(skill => skill.id !== skillToDelete));
            // Remove from pinned
            setPinnedSkillIds(prev => prev.filter(skillId => skillId !== skillToDelete));
            if (skill) {
                showToast(`Skill "${skill.name}" deleted successfully!`);
            }
        } catch (err) {
            console.error('Failed to delete skill:', err);
            showToast('Failed to delete skill. Please try again.', 'error');
        } finally {
            setDeleteConfirmOpen(false);
            setSkillToDelete(null);
        }
    };

    const handleStartEditSkill = (skillId: number, currentLevel: number) => {
        setEditingSkillId(skillId);
        setTempSkillLevels(prev => ({ ...prev, [skillId]: currentLevel }));
    };

    const handleSaveEditSkill = async (skillId: number) => {
        const newLevel = tempSkillLevels[skillId];
        const skill = allSkills.find(s => s.id === skillId);
        if (newLevel !== undefined) {
            try {
                await updateUserSkill(skillId, { level: `${newLevel}` });
                setAllSkills(prevSkills =>
                    prevSkills.map(skill =>
                        skill.id === skillId ? { ...skill, level: newLevel } : skill
                    )
                );
                if (skill) {
                    showToast(`"${skill.name}" updated to ${newLevel}%!`);
                }
            } catch (err) {
                console.error('Failed to update skill:', err);
                showToast('Failed to update skill. Please try again.', 'error');
            }
        }
        setEditingSkillId(null);
    };

    const handleCancelEditSkill = () => {
        setEditingSkillId(null);
    };

    const handleTempLevelChange = (skillId: number, newValue: number | number[]) => {
        setTempSkillLevels(prev => ({ ...prev, [skillId]: newValue as number }));
    };

    if (loading) {
        return (
            <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && allSkills.length === 0) {
        return (
            <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={loadSkills}>
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Professional Summary
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Your profile overview and skill assessment at a glance
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Profile Card */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            height: '100%',
                            borderRadius: 2,
                        }}
                    >
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                                fontWeight: 600,
                                mb: 3,
                                color: 'primary.main'
                            }}
                        >
                            Profile Information
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Full Name</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{profileData.fullName}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Email</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{profileData.email}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Employee Code</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{profileData.employeeCode}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Business Unit</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{profileData.businessUnit}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Job Title</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{profileData.jobTitle}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Leader</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{profileData.leader}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                                <Typography variant="caption" color="text.secondary">Manager</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{profileData.manager}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Skills Assessment Card */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            height: '100%',
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: 'primary.main'
                                }}
                            >
                                Skill Assessment
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                size="small"
                                onClick={() => setMySkillsOpen(true)}
                            >
                                My Skills
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {displayedSkills.map((skill) => (
                                <Box key={skill.id}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 500, color: 'text.primary' }}
                                        >
                                            {skill.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: 'primary.main'
                                                }}
                                            >
                                                {skill.level}%
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleUnpinSkill(skill.id)}
                                                title="Unpin from top 4"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    <Slider
                                        value={skill.level}
                                        onChange={(_, newValue) => handleSkillChange(skill.id, newValue)}
                                        min={0}
                                        max={100}
                                        step={5}
                                        valueLabelDisplay="auto"
                                        sx={{
                                            '& .MuiSlider-thumb': {
                                                width: 20,
                                                height: 20,
                                            },
                                            '& .MuiSlider-track': {
                                                background: `linear-gradient(90deg, 
                                                    ${skill.level >= 80 ? '#4caf50' : '#2196f3'} 0%, 
                                                    ${skill.level >= 80 ? '#81c784' : '#64b5f6'} 100%)`
                                            }
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>

                        <Box
                            sx={{
                                mt: 3,
                                pt: 3,
                                borderTop: '1px solid rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                💡 Top 4 skills are displayed. Refresh page to update rankings.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Quick Stats Cards */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2.5,
                            textAlign: 'center',
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.coreSkills}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Core Skills
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2.5,
                            textAlign: 'center',
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.avgProficiency}%
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Average Proficiency
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2.5,
                            textAlign: 'center',
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.strongSkills}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Strong Skills (≥70%)
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2.5,
                            textAlign: 'center',
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.topSkillLevel}%
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Top Skill Level
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* My Skills Dialog */}
            <Dialog
                open={mySkillsOpen}
                onClose={() => {
                    setMySkillsOpen(false);
                    setNewSkillName('');
                    setNewSkillLevel(50);
                    setEditingSkillId(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>My Skills</DialogTitle>
                <DialogContent>
                    {/* Create New Custom Skill Section */}
                    <Box sx={{ mb: 3, mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                            Create Custom Skill
                        </Typography>
                        <TextField
                            fullWidth
                            label="Skill Name"
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            placeholder="e.g., Public Speaking"
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ px: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Skill Level
                                </Typography>
                                <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                                    {newSkillLevel}%
                                </Typography>
                            </Box>
                            <Slider
                                value={newSkillLevel}
                                onChange={(_, newValue) => setNewSkillLevel(newValue as number)}
                                min={0}
                                max={100}
                                step={5}
                                valueLabelDisplay="auto"
                            />
                        </Box>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleCreateAndPinNewSkill}
                            disabled={!newSkillName.trim()}
                            sx={{ mt: 1 }}
                        >
                            Create Skill
                        </Button>
                    </Box>

                    <Divider sx={{ my: 2 }}>
                        <Typography variant="caption" color="text.secondary">OR SELECT EXISTING</Typography>
                    </Divider>

                    {/* Select Existing Unpinned Skills */}
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Your Other Skills
                    </Typography>
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {unpinnedSkills.length > 0 ? (
                            unpinnedSkills.map((skill) => {
                                const isEditing = editingSkillId === skill.id;
                                const displayLevel = isEditing
                                    ? (tempSkillLevels[skill.id] ?? skill.level)
                                    : skill.level;

                                return (
                                    <ListItem
                                        key={skill.id}
                                        disablePadding
                                        sx={{
                                            flexDirection: 'column',
                                            alignItems: 'stretch',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            py: 1
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 2, py: 1 }}>
                                            <ListItemButton
                                                onClick={() => !isEditing && handlePinExistingSkill(skill)}
                                                disabled={isEditing}
                                                sx={{ flex: 1, borderRadius: 1 }}
                                            >
                                                <ListItemText
                                                    primary={skill.name}
                                                    secondary={`Level: ${displayLevel}%`}
                                                />
                                            </ListItemButton>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {isEditing ? (
                                                    <>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => handleSaveEditSkill(skill.id)}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={handleCancelEditSkill}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => handleStartEditSkill(skill.id, skill.level)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <IconButton
                                                            edge="end"
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleDeleteSkill(skill.id)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                        {isEditing && (
                                            <Box sx={{ px: 3, pb: 1 }}>
                                                <Slider
                                                    value={displayLevel}
                                                    onChange={(_, newValue) => handleTempLevelChange(skill.id, newValue)}
                                                    min={0}
                                                    max={100}
                                                    step={5}
                                                    valueLabelDisplay="auto"
                                                    size="small"
                                                />
                                            </Box>
                                        )}
                                    </ListItem>
                                );
                            })
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                All skills are pinned
                            </Typography>
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setMySkillsOpen(false);
                        setNewSkillName('');
                        setNewSkillLevel(50);
                        setEditingSkillId(null);
                    }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this skill? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={confirmDeleteSkill} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toast Notification */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={3000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseToast} severity={toastSeverity} sx={{ width: '100%' }}>
                    {toastMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

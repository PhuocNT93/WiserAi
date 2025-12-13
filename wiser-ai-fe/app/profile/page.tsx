'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import api from '@/utils/api';
import { Alert, CircularProgress } from '@mui/material';

export default function ProfilePage() {
    const { user, refreshProfile } = useAuth();
    const t = useTranslations('Auth');
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setSuccess(null);
        setError(null);
        const data = new FormData(event.currentTarget);
        const payload = {
            fullName: data.get('fullName'),
        };

        try {
            await api.patch('/users/profile', payload);
            await refreshProfile();
            setSuccess('Profile updated successfully');
        } catch (err) {
            console.error(err);
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    My Profile
                </Typography>

                <Box display="flex" alignItems="center" mb={4}>
                    <Avatar
                        src={user.avatarUrl || "/static/images/avatar/2.jpg"}
                        sx={{ width: 100, height: 100, mr: 3 }}
                    />
                    <Box>
                        <Typography variant="h6">{user.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, px: 1, py: 0.5, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1, width: 'fit-content' }}>
                            {user.role}
                        </Typography>
                    </Box>
                </Box>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        fullWidth
                        label="Email"
                        value={user.email}
                        disabled
                        helperText="Email cannot be changed"
                    />

                    <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        defaultValue={user.fullName}
                        required
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

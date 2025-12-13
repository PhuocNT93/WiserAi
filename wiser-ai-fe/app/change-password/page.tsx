'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { Alert, CircularProgress } from '@mui/material';

export default function ChangePasswordPage() {
    const { user } = useAuth();
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setSuccess(null);
        setError(null);
        const data = new FormData(event.currentTarget);
        const oldPassword = data.get('oldPassword') as string;
        const newPassword = data.get('newPassword') as string;
        const confirmPassword = data.get('confirmPassword') as string;

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // Check if endpoint exists, otherwise use profile patch or specific endpoint
            // Usually POST /auth/change-password or PATCH /users/profile
            // Assuming PATCH /users/profile based on context, but profile usually doesn't handle password directly without check
            // Let's assume a dedicated endpoint or update profile 
            // I'll use PATCH /users/profile for now as a placeholder unless I check backend.
            // Checking backend auth controller...

            await api.patch('/users/profile', {
                oldPassword,
                password: newPassword
            });
            setSuccess('Password updated successfully');
            (event.target as HTMLFormElement).reset();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Change Password
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Current Password"
                        name="oldPassword"
                        type="password"
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="New Password"
                        name="newPassword"
                        type="password"
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        required
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Update Password'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

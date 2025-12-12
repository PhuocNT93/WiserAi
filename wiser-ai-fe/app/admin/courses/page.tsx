'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

export default function CreateCoursePage() {
    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>Create New Course</Typography>
            <Paper sx={{ p: 4, mt: 2 }}>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField label="Course Name" fullWidth required />
                    <TextField label="Description" fullWidth multiline rows={4} />
                    <TextField select label="Category" fullWidth defaultValue="">
                        <MenuItem value="hardskill">Hard Skill</MenuItem>
                        <MenuItem value="softskill">Soft Skill</MenuItem>
                        <MenuItem value="compliance">Compliance</MenuItem>
                    </TextField>

                    <Button variant="outlined" component="label">
                        Upload Course Image
                        <input type="file" hidden accept="image/*" />
                    </Button>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                        <Button variant="outlined">Cancel</Button>
                        <Button variant="contained" color="primary">Create Course</Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

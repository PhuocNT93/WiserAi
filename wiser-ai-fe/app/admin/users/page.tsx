'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'role', headerName: 'Role', width: 150 },
];

const rows = [
    { id: 1, name: 'Logan McNeil', email: 'logan@example.com', role: 'ADMIN' },
    { id: 2, name: 'Joy Song', email: 'joy@example.com', role: 'MANAGER' },
];

export default function UsersPage() {
    const [open, setOpen] = React.useState(false);

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">User Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Add User
                </Button>
            </Box>

            <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
            />

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add User</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="Name" fullWidth />
                        <TextField label="Email" fullWidth />
                        <TextField label="Role" fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={() => setOpen(false)} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

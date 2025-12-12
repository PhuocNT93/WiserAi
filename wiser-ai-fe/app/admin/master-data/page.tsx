'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'code', headerName: 'Code', width: 150 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'value', headerName: 'Value', width: 200 },
];

const rows = [
    { id: 1, category: 'SKILL', code: 'JAVA', name: 'Java', value: 'Backend' },
    { id: 2, category: 'SKILL', code: 'REACT', name: 'React', value: 'Frontend' },
    { id: 3, category: 'DEPT', code: 'HR', name: 'Human Resources', value: 'Corporate' },
];

export default function MasterDataPage() {
    const [open, setOpen] = React.useState(false);

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('Importing excel:', file.name);
            alert(`Simulating import of ${file.name}`);
        }
    };

    const handleSave = () => {
        // Save logic
        setOpen(false);
    };

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">Master Data Management</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                        Add New
                    </Button>
                    <Button component="label" variant="outlined" startIcon={<UploadIcon />}>
                        Import Excel
                        <input type="file" hidden accept=".xlsx, .xls" onChange={handleImport} />
                    </Button>
                </Box>
            </Box>

            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                }}
                pageSizeOptions={[5, 10]}
                slots={{ toolbar: GridToolbar }}
                checkboxSelection
            />

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add Master Data</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="Category" fullWidth />
                        <TextField label="Code" fullWidth />
                        <TextField label="Name" fullWidth />
                        <TextField label="Value" fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

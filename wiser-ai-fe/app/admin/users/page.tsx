'use client';
import * as React from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    InputAdornment,
    Snackbar,
    Alert
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '@/utils/api';

// ================= TYPES =================
export interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    level?: string;
    jobTitle?: string;
}

interface UserForm {
    name: string;
    email: string;
    role: string;
    password: string;
    level: string;
    jobTitle: string;
    confirmPassword: string;
}

const emptyForm: UserForm = {
    name: '',
    email: '',
    role: 'MEMBER',
    password: '',
    level: '',
    jobTitle: '',
    confirmPassword: ''
};

// ================= COMPONENT =================
export default function UsersPage() {
    const [rows, setRows] = React.useState<User[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);  // Added for button loading

    const [openAdd, setOpenAdd] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);

    const [form, setForm] = React.useState<UserForm>(emptyForm);
    const [editForm, setEditForm] = React.useState<UserForm & { id: number }>({ ...emptyForm, id: 0 });
    const [selected, setSelected] = React.useState<User | null>(null);
    const [showPasswordAdd, setShowPasswordAdd] = React.useState(false);  // Separate for add
    const [showPasswordEdit, setShowPasswordEdit] = React.useState(false);  // Separate for edit

    // highlight field errors
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

    const [snackbar, setSnackbar] = React.useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning'
    });

    // ================= FETCH =================
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            console.log("Fetched users:", res.data);
            setRows(res.data.data);
        } catch (error) {
            setSnackbar({ open: true, severity: 'error', message: 'Failed to load users.' });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    // ================= VALIDATION =================
    const validateForm = (data: UserForm) => {
        const errors: Record<string, string> = {};
        if (!data.name) errors.name = 'Name is required';
        if (!data.email) errors.email = 'Email is required';
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email format';
        if (!data.password) errors.password = 'Password is required';
        if (data.password && data.password.length < 6) errors.password = 'Min 6 characters';
        if (data.password !== data.confirmPassword) errors.confirmPassword = 'Confirm Password mismatch';
        return errors;
    };

    // ================= ADD =================
    const handleAddSave = async () => {
        console.log("Save button clicked");
        console.log("Form data to send:", form);
        const errors = validateForm(form);
        console.log(errors);
        setFormErrors(errors);
        if (Object.keys(errors).length) {
            setSnackbar({ open: true, severity: 'warning', message: 'Please fix form error.' });
            return;
        }

        setSaving(true);
        try {
            await api.post('/users', {
                name: form.name,
                email: form.email,
                roles: [form.role],
                password: form.password,
                level: form.level,
                jobTitle: form.jobTitle
            });

            setSnackbar({ open: true, severity: 'success', message: 'User created successfully' });
            setOpenAdd(false);
            setForm(emptyForm);
            setFormErrors({});
            fetchUsers();
        } catch (err: unknown) {
            let message = 'Create user failed';

            setSnackbar({
                open: true,
                severity: 'error',
                message
            });
        } finally {
            setSaving(false);
        }
    };

    // ================= EDIT =================
    const handleEditOpen = (u: User) => {
        setEditForm({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.roles[0] || 'MEMBER',
            password: '',
            level: u.level || '',
            jobTitle: u.jobTitle || '',
            confirmPassword: ''
        });
        setFormErrors({});
        setOpenEdit(true);
    };

    const handleEditSave = async () => {
        const errors = validateForm(editForm);
        setFormErrors(errors);
        if (Object.keys(errors).length) {
            setSnackbar({ open: true, severity: 'warning', message: 'Please fix form error.' });
            return;
        }

        setSaving(true);
        try {
            const payload: any = {
                name: editForm.name,
                email: editForm.email,
                roles: [editForm.role],
                level: editForm.level,
                jobTitle: editForm.jobTitle
            };
            if (editForm.password) payload.password = editForm.password;  // Only include if set

            const res = await api.patch<User>(`/users/${editForm.id}`, payload);

            setRows(rows.map(r => (r.id === editForm.id ? res.data : r)));
            setOpenEdit(false);
            setSnackbar({ open: true, severity: 'success', message: 'User updated successfully' });
        } catch {
            setSnackbar({ open: true, severity: 'error', message: 'Update failed' });
        } finally {
            setSaving(false);
        }
    };

    // ================= DELETE =================
    const handleDeleteConfirm = async () => {
        if (!selected) return;
        try {
            await api.delete(`/users/${selected.id}`);
            setRows(rows.filter(r => r.id !== selected.id));
            setOpenDelete(false);
            setSnackbar({ open: true, severity: 'success', message: 'User deleted' });
        } catch {
            setSnackbar({ open: true, severity: 'error', message: 'Delete failed' });
        }
    };

    // ================= TABLE =================
    const columns: GridColDef<User>[] = [
        { field: 'name', headerName: 'Name', width: 180 },
        { field: 'email', headerName: 'Email', width: 220 },
        {
            field: 'roles',
            headerName: 'Roles',
            width: 120,
            valueGetter: (params: GridRenderCellParams<User>) => {
                const roles = params.value ?? [];
                return Array.isArray(roles) ? roles.join(', ') : '';
            }
        },
        { field: 'level', headerName: 'Level', width: 120 },
        { field: 'jobTitle', headerName: 'Job Title', width: 160 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params: GridRenderCellParams<User>) => (
                <>
                    <IconButton color="success" onClick={() => handleEditOpen(params.row)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => { setSelected(params.row); setOpenDelete(true); }}><DeleteIcon /></IconButton>
                </>
            )
        }
    ];

    // ================= RENDER =================
    return (
        <Box sx={{ height: 650 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">User Management</Typography>
                <Button startIcon={<AddIcon />} variant="contained" onClick={() => { setOpenAdd(true); setForm(emptyForm); setFormErrors({}); }}>Add User</Button>
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
                checkboxSelection
                getRowId={(row) => row.id}
            />

            {/* ADD */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
                <DialogTitle align="center">Add User</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 1 }}>
                        <TextField label="Name" error={!!formErrors.name} helperText={formErrors.name} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        <TextField label="Email" error={!!formErrors.email} helperText={formErrors.email} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                <MenuItem value="MEMBER">MEMBER</MenuItem>
                                <MenuItem value="MANAGER">MANAGER</MenuItem>
                                <MenuItem value="HR">HR</MenuItem>
                                <MenuItem value="ADMIN">ADMIN</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField label="Level" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} />
                        <TextField label="Job Title" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} />
                        <TextField
                            label="Password"
                            type={showPasswordAdd ? 'text' : 'password'}
                            error={!!formErrors.password}
                            helperText={formErrors.password}
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPasswordAdd(p => !p)}>
                                            {showPasswordAdd ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            label="Confirm Password"
                            type={showPasswordAdd ? 'text' : 'password'}
                            error={!!formErrors.confirmPassword}
                            helperText={formErrors.confirmPassword}
                            value={form.confirmPassword}
                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPasswordAdd(p => !p)}>
                                            {showPasswordAdd ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
                    <Button variant="contained" disabled={saving} onClick={handleAddSave}>{saving ? 'Saving...' : 'Save'}</Button>
                </DialogActions>
            </Dialog>

            {/* EDIT */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
                <DialogTitle align="center">Edit User</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                        <TextField
                            label="Name"
                            error={!!formErrors.name}
                            helperText={formErrors.name}
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        />
                        <TextField
                            label="Email"
                            error={!!formErrors.email}
                            helperText={formErrors.email}
                            value={editForm.email}
                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={editForm.role}
                                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                            >
                                <MenuItem value="MEMBER">MEMBER</MenuItem>
                                <MenuItem value="MANAGER">MANAGER</MenuItem>
                                <MenuItem value="HR">HR</MenuItem>
                                <MenuItem value="ADMIN">ADMIN</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Level"
                            value={editForm.level}
                            onChange={e => setEditForm({ ...editForm, level: e.target.value })}
                        />
                        <TextField
                            label="Job Title"
                            value={editForm.jobTitle}
                            onChange={e => setEditForm({ ...editForm, jobTitle: e.target.value })}
                        />
                        <TextField
                            label="Password"
                            type={showPasswordEdit ? 'text' : 'password'}
                            value={editForm.password}
                            onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPasswordEdit(p => !p)}>
                                            {showPasswordEdit ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button variant="contained" disabled={saving} onClick={handleEditSave}>{saving ? 'Saving...' : 'Save'}</Button>
                </DialogActions>
            </Dialog>

            {/* DELETE */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>Delete <b>{selected?.name}</b>?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button color="error" onClick={handleDeleteConfirm}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}
'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    FormControl,
    Select,
    MenuItem,
    InputAdornment,
    IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import api from '@/utils/api';

// ------------------- TYPES -------------------
interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    userId: number;
    createdAt?: string;
    updatedAt?: string;
}

// interface CreateUserDto {
//     name: string;
//     email: string;
//     roles: string[];
//     userId: string;
//     password: string;
//     level: string;
//     jobTitle: string;
// }

// ------------------- API SETUP -------------------
const API = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ------------------- COMPONENT -------------------
export default function UsersPage() {
    const [rows, setRows] = React.useState<User[]>([]);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [paginationModel, setPaginationModel] = React.useState({ pageSize: 10, page: 0 });

    const [openAdd, setOpenAdd] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);

    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        role: "MEMBER",
        password: "",
        level: "",
        jobTitle: "",
    });

    const [editFormData, setEditFormData] = React.useState({
        id: 0,
        name: "",
        email: "",
        role: "MEMBER",
        password: "",
        level: "",
        jobTitle: "",
    });

    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [showPassword, setShowPassword] = React.useState(false);
    const [errors, setErrors] = React.useState({ name: false, email: false, role: false, password: false, level: false, jobTitle: false });

    // ------------------- FETCH USERS -------------------
    const fetchUsers = async () => {
        try {
            const res = await api.get<User[]>('/users');
            setRows(res.data);
            setIsLoaded(true);
        } catch (err) {
            console.error(err);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    // ------------------- ADD USER -------------------
    const handleOpenAdd = () => {
        setFormData({ name: "", email: "", role: "MEMBER", password: "", level: "", jobTitle: "" });
        setErrors({ name: false, email: false, role: false, password: false, level: false, jobTitle: false });
        setOpenAdd(true);
    };

    const handleSave = async () => {
        // 1. Validate mandatory fields
        const newErrors = {
            name: !formData.name,
            email: !formData.email,
            role: !formData.role,
            password: !formData.password || formData.password.length < 6 || formData.password.length > 8,
            level: !formData.level,
            jobTitle: !formData.jobTitle
        };
        setErrors(newErrors);

        if (Object.values(newErrors).some(Boolean)) return;

        try {
            const res = await API.post<User>('/users', {
                name: formData.name,
                email: formData.email,
                roles: [formData.role],
                password: formData.password,
                level: formData.level,
                jobTitle: formData.jobTitle
            });

            setRows([...rows, res.data]);
            setOpenAdd(false);
            setFormData({ name: "", email: "", role: "MEMBER", password: "", level: "", jobTitle: "" });
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                // Axios error
                alert('Create user failed: ' + (error.response?.data?.message || error.message));
            } else if (error instanceof Error) {
                // Generic JS error
                alert('Create user failed: ' + error.message);
            } else {
                alert('Create user failed');
            }
            console.error(error);
        }
    };



    // ------------------- EDIT USER -------------------
    const handleEdit = (row: User) => {
        setEditFormData({
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.roles[0] || "MEMBER",
            password: "",
            level: "",
            jobTitle: ""
        });
        setOpenEdit(true);
    };

    const handleEditSave = async () => {
        try {
            const res = await API.patch<User>(`/users/${editFormData.id}`, {
                name: editFormData.name,
                email: editFormData.email,
                roles: [editFormData.role],
                password: editFormData.password || undefined
            });
            setRows(rows.map(r => r.id === editFormData.id ? res.data : r));
            setOpenEdit(false);
        } catch (err) {
            console.error(err);
        }
    };

    // ------------------- DELETE USER -------------------
    const handleDelete = (row: User) => {
        setSelectedUser(row);
        setOpenDelete(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;
        try {
            await API.delete(`/users/${selectedUser.id}`);
            setRows(rows.filter(r => r.id !== selectedUser.id));
            setOpenDelete(false);
        } catch (err) {
            console.error(err);
        }
    };

    // ------------------- DATAGRID COLUMNS -------------------
    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', width: 200, align: "center", headerAlign: "center" },
        { field: 'email', headerName: 'Email', width: 200, align: "center", headerAlign: "center" },
        { field: 'roles', headerName: 'Roles', width: 200, align: "center", headerAlign: "center" },
        { field: 'userId', headerName: 'User Id', width: 200, align: "center", headerAlign: "center" },
        { field: 'level', headerName: 'Level', width: 200, align: "center", headerAlign: "center" },
        { field: 'jobTitle', headerName: 'Job Title', width: 200, align: "center", headerAlign: "center" },
        { field: 'createdAt', headerName: 'Create Date', width: 200, align: "center", headerAlign: "center" },
        { field: 'updatedAt', headerName: 'Update Date', width: 200, align: "center", headerAlign: "center" },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => (
                <Box>
                    <IconButton color="success" onClick={() => handleEdit(params.row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(params.row)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    // ------------------- RENDER -------------------
    return (
        <Box sx={{ height: 631, width: '100%' }}>
            {isLoaded ? (
                <>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5">User Management</Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                            Add User
                        </Button>
                    </Box>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSizeOptions={[10, 20, 50]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                        getRowId={(row) => row.id}
                    />
                </>
            ) : (
                <Typography>Loading...</Typography>
            )}

            {/* ADD USER DIALOG */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
                <DialogTitle>Add User</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                        <Box sx={{ flex: '1 1 45%' }}>
                            <TextField label="Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </Box>
                        <Box sx={{ flex: '1 1 45%' }}>
                            <TextField label="Email" fullWidth value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </Box>
                        <Box sx={{ flex: '1 1 45%' }}>
                            <FormControl fullWidth>
                                <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                    <MenuItem value="MEMBER">MEMBER</MenuItem>
                                    <MenuItem value="MANAGER">MANAGER</MenuItem>
                                    <MenuItem value="HR">HR</MenuItem>
                                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ flex: '1 1 45%' }}>
                            <TextField label="Level" fullWidth value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} />
                        </Box>
                        <Box sx={{ flex: '1 1 45%' }}>
                            <TextField label="Job Title" fullWidth value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} />
                        </Box>
                        <Box sx={{ flex: '1 1 45%' }}>
                            <TextField
                                label="Password"
                                fullWidth
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* EDIT USER DIALOG */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                        <Box sx={{ flex: '1 1 45%' }}>
                            <TextField label="Name" fullWidth value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
                        </Box>
                        <Box sx={{ flex: '1 1 45%' }}>
                            <TextField label="Email" fullWidth value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} />
                        </Box>
                        <Box sx={{ flex: '1 1 45%' }}>
                            <FormControl fullWidth>
                                <Select value={editFormData.role} onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}>
                                    <MenuItem value="MEMBER">MEMBER</MenuItem>
                                    <MenuItem value="MANAGER">MANAGER</MenuItem>
                                    <MenuItem value="HR">HR</MenuItem>
                                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ flex: '1 1 45%' }}>
                            <TextField label="Level" fullWidth value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} />
                        </Box>
                        <Box sx={{ flex: '1 1 45%' }}>
                            <TextField label="Job Title" fullWidth value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} />
                        </Box>
                        <Box sx={{ flex: '1 1 45%' }}>
                            <TextField
                                label="Password"
                                fullWidth
                                type={showPassword ? "text" : "password"}
                                value={editFormData.password}
                                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSave}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* DELETE CONFIRM DIALOG */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    You want to delete user: <b>{selectedUser?.name}</b>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

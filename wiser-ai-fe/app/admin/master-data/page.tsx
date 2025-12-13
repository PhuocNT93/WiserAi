'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, IconButton, Paper, Tabs, Tab, MenuItem, Select } from '@mui/material';
import _ from 'lodash';
import { Delete, OpenInNew } from '@mui/icons-material';
import api from '@/utils/api';  // Assuming this is an axios instance

// Removed unused MOCK UP DATA (rows)

const apiObject = {
    role_skill_mapping: '/role-skill-mapping',
    employee_profile: '/employee-profile',
    users: '/users'
};
const positions = [
    {
        value: 'DEV',
        label: 'DEV'
    },
    {
        value: 'QA',
        label: 'QA'
    },
    {
        value: 'BA',
        label: 'BA'
    }
];
const levels = [
    {
        value: 'Fresher',
        label: 'Fresher'
    },
    {
        value: 'Junior',
        label: 'Junior'
    },
    {
        value: 'Senior',
        label: 'Senior'
    },
    {
        value: 'Master',
        label: 'Master'
    }
]

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

type RoleSkillMapping = {
    id: number;
    position: string;
    code: string;
    name: string;
    level: string;
    description: string;
};

type User = {
    id: number;
    email: string;
    name: string;
};

type EmployeeProfileMapping = {
    id: number;
    userEmail: string;
    engName: string;
    empCode: string;
    busUnit: string;
    jobTitle: string;
};

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function MasterDataPage() {
    const roleMappingColumns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'position', headerName: 'Position', width: 150 },
        { field: 'code', headerName: 'Code', width: 150 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'level', headerName: 'Level', width: 200 },
        { field: 'description', headerName: 'Description', width: 400 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleEditRoleMappingForm(params.row)} color="primary">
                        <OpenInNew />  {/* Edit icon */}
                    </IconButton>
                    <IconButton onClick={() => handleDelete(
                        params.row.id,
                        "role-mapping",
                        "Are you sure you want to delete this role-skill mapping? This action cannot be undone."
                    )} color="error">
                        <Delete />
                    </IconButton>
                </Box>
            ),
        },
    ];
    const employeeProfileColumns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'position', headerName: 'Position', width: 150 },
        { field: 'code', headerName: 'Code', width: 150 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'level', headerName: 'Level', width: 200 },
        { field: 'description', headerName: 'Description', width: 400 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleEditEmployeeProfileForm(params.row)} color="primary">
                        <OpenInNew />  {/* Edit icon */}
                    </IconButton>
                    <IconButton onClick={() => handleDelete(
                        params.row.id,
                        "employee-profile",
                        "Are you sure you want to delete employee profile? This action cannot be undone."
                    )} color="error">
                        <Delete />
                    </IconButton>
                </Box>
            ),
        },
    ];

    /** REACT STATE CONTROL */
    const [panel, setPanel] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
    const [form, setForm] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [deleteId, setDeleteId] = React.useState<number | null>(null);
    const [allRoleSkillData, setAllRoleSkillData] = React.useState<RoleSkillMapping[]>([]);
    const [allEmployeeProfileData, setAllEmployeeProfileData] = React.useState<EmployeeProfileMapping[]>([]);
    const [isEdit, setIsEdit] = React.useState(false);
    const [editId, setEditId] = React.useState<number | null>(null);
    const [roleSkillMappingValues, setRoleSkillMappingValues] = React.useState<Omit<RoleSkillMapping, 'id'>>({
        position: '',
        code: '',
        name: '',
        level: '',
        description: ''
    });
    const [employeeProfileValues, setEmployeeProfileValues] = React.useState<Omit<EmployeeProfileMapping, 'id'>>({
        userEmail: '',
        engName: '',
        empCode: '',
        busUnit: '',
        jobTitle: ''
    });
    const [loading, setLoading] = React.useState(true);  // Added: For loading state
    /** END OF REACT STATE */

    /** REACT useEffect CONTROL */
    const resetRoleMappingForm = () => {
        setRoleSkillMappingValues({ position: '', code: '', name: '', level: '', description: '' });
        setOpen(false);
        setIsEdit(false);
        setEditId(null);
    };
    const resetEmployeeProfileForm = () => {
        setEmployeeProfileValues({ userEmail: '', engName: '', empCode: '', busUnit: '', jobTitle: '' });
        setOpen(false);
        setIsEdit(false);
        setEditId(null);
    };

    const fetchRoleSkillData = async () => {
        try {
            const response = await api.get(apiObject.role_skill_mapping);
            setAllRoleSkillData(response.data.data);
        } catch (error) {
            console.error('Error fetching role-skill data:', error);
        }
    };

    const fetchEmployeeProfileData = async () => {
        try {
            const response = await api.get(apiObject.employee_profile);  // Fixed: Used api.get and correct endpoint
            setAllEmployeeProfileData(response.data.data);  // Fixed: Correct setter
        } catch (error) {
            console.error('Error fetching employee profile data:', error);
        }
    };

    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchRoleSkillData(), fetchEmployeeProfileData()]);
            setLoading(false);
        };
        loadData();
    }, []);
    /** END OF REACT useEffect */

    /** MAIN HANDLERS */
    const handleChangePanel = (event: React.SyntheticEvent, newValue: number) => {
        setPanel(newValue);
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('Importing excel:', file.name);
            alert(`Simulating import of ${file.name}`);
        }
    };

    const handleSaveRoleSkillMapping = async (excelData: RoleSkillMapping[]) => {  // Fixed: Correct type
        try {
            if (_.isEmpty(excelData)) {
                const newData = {
                    ...roleSkillMappingValues,
                    updatedAt: new Date().toISOString()
                };
                console.log('Saving manual data:', newData);
                if (!isEdit) {
                    await api.post(apiObject.role_skill_mapping, newData);  // Fixed: Correct API call
                    resetRoleMappingForm();
                    await fetchRoleSkillData();  // Re-fetch
                } else {
                    if (!editId) {
                        console.error('No editId for patch');
                        return;
                    }
                    const updatedData = { id: editId, ...roleSkillMappingValues, updatedAt: new Date().toISOString() };
                    console.log('Patching manual data:', updatedData);
                    await api.patch(`${apiObject.role_skill_mapping}/${editId}`, updatedData);  // Fixed: Correct API call
                    resetRoleMappingForm();
                    await fetchRoleSkillData();  // Re-fetch
                }
            } else {
                // Excel import: Process the array
                console.log('Saving Excel data:', excelData);
                // TODO: Send bulk data (e.g., await api.post('/api/role-skill-mapping/bulk', excelData))
                await fetchRoleSkillData();  // Re-fetch
            }
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };
    const handleSaveEmployeeProfile = async (excelData: RoleSkillMapping[]) => {  // Fixed: Correct type
        try {
            if (_.isEmpty(excelData)) {
                const newData = {
                    ...employeeProfileValues,
                    updatedAt: new Date().toISOString()
                };
                console.log('Saving manual data:', newData);
                if (!isEdit) {
                    await api.post(apiObject.employee_profile, newData);  // Fixed: Correct API call
                    resetEmployeeProfileForm();
                    await fetchEmployeeProfileData();  // Re-fetch
                } else {
                    if (!editId) {
                        console.error('No editId for patch');
                        return;
                    }
                    const updatedData = { id: editId, ...employeeProfileValues, updatedAt: new Date().toISOString() };
                    console.log('Patching manual data:', updatedData);
                    await api.patch(`${apiObject.employee_profile}/${editId}`, updatedData);  // Fixed: Correct API call
                    resetEmployeeProfileForm();
                    await fetchEmployeeProfileData();  // Re-fetch
                }
            } else {
                // Excel import: Process the array
                console.log('Saving Excel data:', excelData);
                // TODO: Send bulk data (e.g., await api.post('/api/role-skill-mapping/bulk', excelData))
                await fetchEmployeeProfileData();  // Re-fetch
            }
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    const handleEditRoleMappingForm = (row: RoleSkillMapping) => {  // Fixed: Correct type
        setIsEdit(true);
        setEditId(row.id);
        setRoleSkillMappingValues({  // Fixed: Correct setter
            position: row.position,
            code: row.code,
            name: row.name,
            level: row.level,
            description: row.description
        });
        setOpen(true);
    };
    const handleEditEmployeeProfileForm = (row: EmployeeProfileMapping) => {
        setIsEdit(true);
        setEditId(row.id);
        setEmployeeProfileValues({  // Fixed: Correct setter
            userEmail: row.userEmail,
            engName: row.engName,
            empCode: row.empCode,
            busUnit: row.busUnit,
            jobTitle: row.jobTitle
        });
        setOpen(true);
    }

    const handleDelete = (id: number, form: string, message: string) => {  // Modified: Now opens confirmation dialog
        setDeleteId(id);
        setForm(form);
        setMessage(message);
        setConfirmDeleteOpen(true);
    };
    const handleConfirmDelete = async () => {  // New: Performs the actual delete
        if (!deleteId) return;
        try {
            if (form === "role-mapping") {
                await api.delete(`${apiObject.role_skill_mapping}/${deleteId}`);
                await fetchRoleSkillData();  // Re-fetch data
            } else if (form === 'employee-profile') {

            }
            setConfirmDeleteOpen(false);  // Close dialog
            setDeleteId(null);  // Reset
        } catch (error) {
            console.error('Error deleting data:', error);
            setConfirmDeleteOpen(false);  // Close on error
        }
    };
    const handleCancelDelete = () => {  // New: Closes dialog without deleting
        setConfirmDeleteOpen(false);
        setDeleteId(null);
    };
    /** END OF MAIN HANDLERS */

    if (loading) return <div>Loading...</div>;  // Added: Loading state

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">Master Data Management</Typography>
                <Tabs value={panel} onChange={handleChangePanel} aria-label="basic tabs example">
                    <Tab label="Employee Profiles" />
                    <Tab label="Role-Skill Mapping" />
                    <Tab label="Learning Catalog" />
                </Tabs>
            </Box>

            {/* Tab 1: Employee Profiles */}
            <CustomTabPanel value={panel} index={0}>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5">Employee Profile Mapping</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add</Button>
                            <Button variant="contained" startIcon={<Delete />} disabled onClick={() => { }}>Delete</Button>  {/* TODO: Implement bulk delete */}
                            <Button component="label" variant="outlined" startIcon={<UploadIcon />}>
                                Import Excel
                                <input type="file" hidden accept=".xlsx, .xls" onChange={handleImport} />
                            </Button>
                        </Box>
                    </Box>

                    <DataGrid
                        rows={allEmployeeProfileData}
                        columns={employeeProfileColumns}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 },
                            },
                        }}
                        pageSizeOptions={[5, 10]}
                        slots={{ toolbar: GridToolbar }}
                        checkboxSelection
                        getRowId={(row) => row.id}
                    />

                    <Dialog open={open} onClose={() => setOpen(false)}>
                        <DialogTitle>{isEdit ? 'Edit Employee Profile' : 'Add Employee Profile'}</DialogTitle>
                        <DialogContent>
                            <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2, width: 500 }}>
                                <TextField
                                    label="User Email"
                                    type='email'
                                    value={employeeProfileValues.userEmail}
                                    fullWidth
                                    onChange={(e) => setEmployeeProfileValues({ ...employeeProfileValues, userEmail: e.target.value })}
                                />
                                <TextField
                                    label="Employee Code"
                                    value={employeeProfileValues.empCode}
                                    fullWidth
                                    onChange={(e) => setEmployeeProfileValues({ ...employeeProfileValues, empCode: e.target.value })}
                                />
                                <TextField
                                    label="English Name"
                                    value={employeeProfileValues.engName}
                                    fullWidth
                                    onChange={(e) => setEmployeeProfileValues({ ...employeeProfileValues, engName: e.target.value })}
                                />
                                <TextField
                                    label="Business Unit"
                                    value={employeeProfileValues.busUnit}
                                    fullWidth
                                    onChange={(e) => setEmployeeProfileValues({ ...employeeProfileValues, busUnit: e.target.value })}
                                />
                                <TextField
                                    label="Job Title"
                                    fullWidth
                                    value={employeeProfileValues.jobTitle}
                                    onChange={(e) => setEmployeeProfileValues({ ...employeeProfileValues, jobTitle: e.target.value })}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={() => handleSaveEmployeeProfile([])} variant="contained">
                                {isEdit ? 'Update' : 'Save'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
            </CustomTabPanel>

            {/* Tab 2: Role-Skill Mapping */}
            <CustomTabPanel value={panel} index={1}>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5">Role-Skill Mapping</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add</Button>
                            <Button variant="contained" startIcon={<Delete />} disabled onClick={() => { }}>Delete</Button>  {/* TODO: Implement bulk delete */}
                            <Button component="label" variant="outlined" startIcon={<UploadIcon />}>
                                Import Excel
                                <input type="file" hidden accept=".xlsx, .xls" onChange={handleImport} />
                            </Button>
                        </Box>
                    </Box>

                    <DataGrid
                        rows={allRoleSkillData}
                        columns={roleMappingColumns}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 },
                            },
                        }}
                        pageSizeOptions={[5, 10]}
                        slots={{ toolbar: GridToolbar }}
                        checkboxSelection
                        getRowId={(row) => row.id}
                    />

                    <Dialog open={open} onClose={() => setOpen(false)}>
                        <DialogTitle>{isEdit ? 'Edit Role-Skill Mapping' : 'Add Role-Skill Mapping'}</DialogTitle>
                        <DialogContent>
                            <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2, width: 500 }}>
                                <Select
                                    label="Position"
                                    value={roleSkillMappingValues.position}
                                    defaultValue={'0'}
                                    fullWidth
                                    onChange={(e) => setRoleSkillMappingValues({ ...roleSkillMappingValues, position: e.target.value })}
                                >
                                    <MenuItem value={'0'}>Please select a position</MenuItem>
                                    {positions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <TextField
                                    label="Code"
                                    fullWidth
                                    value={roleSkillMappingValues.code}
                                    onChange={(e) => setRoleSkillMappingValues({ ...roleSkillMappingValues, code: e.target.value })}
                                />
                                <TextField
                                    label="Name"
                                    fullWidth
                                    value={roleSkillMappingValues.name}
                                    onChange={(e) => setRoleSkillMappingValues({ ...roleSkillMappingValues, name: e.target.value })}
                                />
                                <Select
                                    label="Level"
                                    value={roleSkillMappingValues.level}
                                    fullWidth
                                    defaultValue={'0'}
                                    onChange={(e) => setRoleSkillMappingValues({ ...roleSkillMappingValues, level: e.target.value })}
                                >
                                    <MenuItem value={'0'}>Please select a level</MenuItem>
                                    {levels.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <TextField
                                    label="Description"
                                    multiline
                                    fullWidth
                                    variant="outlined"
                                    value={roleSkillMappingValues.description}
                                    onChange={(e) => setRoleSkillMappingValues({ ...roleSkillMappingValues, description: e.target.value })}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={() => handleSaveRoleSkillMapping([])} variant="contained">
                                {isEdit ? 'Update' : 'Save'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
            </CustomTabPanel>

            {/* Tab 3: Learning Catalog */}
            <CustomTabPanel value={panel} index={2}>
                <Paper sx={{ p: 3 }}>
                    <Typography>Learning Catalog content goes here.</Typography>
                </Paper>
            </CustomTabPanel>

            {/* Confirmation Dialog for Delete */}
            <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>{message}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>No</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Yes, Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

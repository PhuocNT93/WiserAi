'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, IconButton, Paper, Tabs, Tab, MenuItem, CircularProgress } from '@mui/material'; // Added CircularProgress
import _ from 'lodash';
import { Delete, OpenInNew } from '@mui/icons-material';
import api from '@/utils/api';

const apiObject = {
    role_skill_mapping: '/role-skill-mapping',
    employee_profile: '/employee-profile',
    users: '/users'
};
const positions = [
    { value: 'DEV', label: 'DEV' },
    { value: 'QA', label: 'QA' },
    { value: 'BA', label: 'BA' }
];
const levels = [
    { value: 'Fresher', label: 'Fresher' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Master', label: 'Master' }
];

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
    updatedAt?: string;  // Added: For update timestamps
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
                    <IconButton onClick={() => handleEditRoleMappingForm(params.row as RoleSkillMapping)} color="primary">
                        <OpenInNew />
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
        { field: 'userEmail', headerName: 'User Email', width: 200 },
        { field: 'empCode', headerName: 'Employee Code', width: 150 },
        { field: 'engName', headerName: 'English Name', width: 200 },
        { field: 'busUnit', headerName: 'Business Unit', width: 200 },
        { field: 'jobTitle', headerName: 'Job Title', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleEditEmployeeProfileForm(params.row as EmployeeProfileMapping)} color="primary">
                        <OpenInNew />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(
                        params.row.id,
                        "employee-profile",
                        "Are you sure you want to delete this employee profile? This action cannot be undone."
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
    const [form, setForm] = React.useState(''); // Used to determine which data set to delete from
    const [message, setMessage] = React.useState('');
    const [deleteId, setDeleteId] = React.useState<number | null>(null);
    const [allRoleSkillData, setAllRoleSkillData] = React.useState<RoleSkillMapping[]>([]);
    const [allEmployeeProfileData, setAllEmployeeProfileData] = React.useState<EmployeeProfileMapping[]>([]); // Data for the employee profiles grid
    const [isEdit, setIsEdit] = React.useState(false);
    const [editId, setEditId] = React.useState<number | null>(null);
    const [roleSkillMappingValues, setRoleSkillMappingValues] = React.useState<Omit<RoleSkillMapping, 'id'>>({
        position: '',
        code: '',
        name: '',
        level: '',
        description: ''
    });
    const [employeeProfileValues, setEmployeeProfileValues] = React.useState<Omit<EmployeeProfileMapping, 'id' | 'updatedAt'>>({
        userEmail: '',
        engName: '',
        empCode: '',
        busUnit: '',
        jobTitle: ''
    });
    const [loading, setLoading] = React.useState(true);
    /** END OF REACT STATE */

    /** Data Fetching/Reset logic */
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
            setAllRoleSkillData(response.data);
        } catch (error) {
            console.error('Error fetching role-skill data:', error);
        }
    };

    const fetchEmployeeProfileData = async () => {
        try {
            const response = await api.get(apiObject.employee_profile);
            setAllEmployeeProfileData(response.data);
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
    /** END OF Data Fetching/Reset logic */

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

    const handleSaveRoleSkillMapping = async (excelData: RoleSkillMapping[] = []) => { // Defaulted to empty array
        try {
            if (_.isEmpty(excelData)) {
                const newData = {
                    ...roleSkillMappingValues,
                    updatedAt: new Date().toISOString() // API might handle this, remove if causing issues
                };
                if (!isEdit) {
                    await api.post(apiObject.role_skill_mapping, newData);
                    resetRoleMappingForm();
                    await fetchRoleSkillData();
                } else {
                    if (!editId) return;
                    const updatedData = { id: editId, ...roleSkillMappingValues };
                    await api.patch(`${apiObject.role_skill_mapping}/${editId}`, updatedData);
                    resetRoleMappingForm();
                    await fetchRoleSkillData();
                }
            } else {
                console.log('Saving Excel data:', excelData);
                // TODO: Implement batch save logic for Excel data
                await fetchRoleSkillData();
            }
        } catch (error) {
            console.error('Error saving role-skill data:', error);
        }
    };

    const handleSaveEmployeeProfile = async (excelData: EmployeeProfileMapping[] = []) => {  // Fixed: Defaulted to empty array
        try {
            if (_.isEmpty(excelData)) {
                const payload = {
                    ...employeeProfileValues,
                    updatedAt: new Date().toISOString()
                };
                
                if (!isEdit) {
                    // CREATE
                    await api.post(apiObject.employee_profile, payload);
                } else {
                    // UPDATE - FIX applied here
                    if (!editId) return;
                    const updatedData = { id: editId, ...payload };
                    await api.patch(`${apiObject.employee_profile}/${editId}`, updatedData);
                }
                
                // Common cleanup and refresh
                resetEmployeeProfileForm();
                await fetchEmployeeProfileData();

            } else {
                // Excel data processing
                console.log('Saving Excel data:', excelData);
                // TODO: Implement batch save logic for Excel data
                await fetchEmployeeProfileData();
            }
        } catch (error) {
            console.error('Error saving employee profile data:', error);
        }
    };


    const handleEditRoleMappingForm = (row: RoleSkillMapping) => {
        setIsEdit(true);
        setEditId(row.id);
        setRoleSkillMappingValues({
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
        setEmployeeProfileValues({
            userEmail: row.userEmail,
            engName: row.engName,
            empCode: row.empCode,
            busUnit: row.busUnit,
            jobTitle: row.jobTitle
        });
        setOpen(true);
    };

    const handleDelete = (id: number, form: string, message: string) => {
        setDeleteId(id);
        setForm(form);
        setMessage(message);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            if (form === "role-mapping") {
                await api.delete(`${apiObject.role_skill_mapping}/${deleteId}`);
                await fetchRoleSkillData();
            } else if (form === 'employee-profile') {
                await api.delete(`${apiObject.employee_profile}/${deleteId}`);
                await fetchEmployeeProfileData();
            }
            setConfirmDeleteOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting data:', error);
            setConfirmDeleteOpen(false);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDeleteOpen(false);
        setDeleteId(null);
    };
    /** END OF MAIN HANDLERS */

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>Loading Master Data...</Typography>
        </Box>
    );

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">Master Data Management</Typography>
                <Tabs value={panel} onChange={handleChangePanel} aria-label="master data tabs">
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
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setOpen(true); setIsEdit(false); resetEmployeeProfileForm(); }}>Add</Button>
                            <Button component="label" variant="outlined" startIcon={<UploadIcon />}>
                                Import Excel
                                <input type="file" hidden accept=".xlsx, .xls" onChange={handleImport} />
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ height: 400, width: '100%' }}>
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
                    </Box>

                    <Dialog open={open && panel === 0} onClose={resetEmployeeProfileForm}>
                        <DialogTitle>{isEdit ? 'Edit Employee Profile' : 'Add Employee Profile'}</DialogTitle>
                        <DialogContent>
                            <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2, width: 500 }}>
                                <TextField
                                    label="User Email"
                                    type='email'
                                    value={employeeProfileValues.userEmail}
                                    fullWidth
                                    onChange={(e) => setEmployeeProfileValues({ ...employeeProfileValues, userEmail: e.target.value })}
                                    margin="dense"
                                />
                                <TextField
                                    label="Employee Code"
                                    value={employeeProfileValues.empCode}
                                    fullWidth
                                    onChange={(e) => setEmployeeProfileValues({ ...employeeProfileValues, empCode: e.target.value })}
                                    margin="dense"
                                />
                                <TextField
                                    label="English Name"
                                    value={employeeProfileValues.engName}
                                    fullWidth
                                    onChange={(e) => setEmployeeProfileValues({ ...employeeProfileValues, engName: e.target.value })}
                                    margin="dense"
                                />
                                <TextField
                                    label="Business Unit"
                                    value={employeeProfileValues.busUnit}
                                    fullWidth
                                    onChange={(e) => setEmployeeProfileValues({ ...employeeProfileValues, busUnit: e.target.value })}
                                    margin="dense"
                                />
                                <TextField
                                    label="Job Title"
                                    fullWidth
                                    value={employeeProfileValues.jobTitle}
                                    onChange={(e) => setEmployeeProfileValues({ ...employeeProfileValues, jobTitle: e.target.value })}
                                    margin="dense"
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={resetEmployeeProfileForm}>Cancel</Button>
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
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setOpen(true); setIsEdit(false); resetRoleMappingForm(); }}>Add</Button>
                            <Button component="label" variant="outlined" startIcon={<UploadIcon />}>
                                Import Excel
                                <input type="file" hidden accept=".xlsx, .xls" onChange={handleImport} />
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ height: 400, width: '100%' }}>
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
                    </Box>

                    <Dialog open={open && panel === 1} onClose={resetRoleMappingForm}> {/* Added panel check */}
                        <DialogTitle>{isEdit ? 'Edit Role-Skill Mapping' : 'Add Role-Skill Mapping'}</DialogTitle>
                        <DialogContent>
                            <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2, width: 500 }}>
                                <TextField
                                    select
                                    label="Position"
                                    value={roleSkillMappingValues.position}
                                    fullWidth
                                    onChange={(e) => setRoleSkillMappingValues({ ...roleSkillMappingValues, position: e.target.value })}
                                    margin="dense"
                                >
                                    {positions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Code"
                                    value={roleSkillMappingValues.code}
                                    fullWidth
                                    onChange={(e) => setRoleSkillMappingValues({ ...roleSkillMappingValues, code: e.target.value })}
                                    margin="dense"
                                />
                                <TextField
                                    label="Name"
                                    value={roleSkillMappingValues.name}
                                    fullWidth
                                    onChange={(e) => setRoleSkillMappingValues({ ...roleSkillMappingValues, name: e.target.value })}
                                    margin="dense"
                                />
                                <TextField
                                    select
                                    label="Level"
                                    value={roleSkillMappingValues.level}
                                    fullWidth
                                    onChange={(e) => setRoleSkillMappingValues({ ...roleSkillMappingValues, level: e.target.value })}
                                    margin="dense"
                                >
                                    {levels.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Description"
                                    multiline
                                    rows={4}
                                    value={roleSkillMappingValues.description}
                                    fullWidth
                                    onChange={(e) => setRoleSkillMappingValues({ ...roleSkillMappingValues, description: e.target.value })}
                                    margin="dense"
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={resetRoleMappingForm}>Cancel</Button>
                            <Button onClick={() => handleSaveRoleSkillMapping([])} variant="contained">
                                {isEdit ? 'Update' : 'Save'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
            </CustomTabPanel>
            
            {/* Tab 3: Learning Catalog (Incomplete, but placeholder for structure) */}
            <CustomTabPanel value={panel} index={2}>
                <Typography variant="h6">Learning Catalog Management (Under Construction)</Typography>
            </CustomTabPanel>

            {/* Common Delete Confirmation Dialog */}
            <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>{message}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
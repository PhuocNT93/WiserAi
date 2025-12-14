import api from '@/utils/api';

export interface EmployeeProfile {
    id: number;
    user: {
        email: string;
        name: string;
    };
    engName: string;
    empCode: string;
    busUnit: string;
    jobTitle: string;
    createdAt: string;
    updatedAt: string;
}

// GET /employee-profile/my-profile - Get current user's employee profile
export async function getMyProfile(): Promise<EmployeeProfile> {
    const response = await api.get('/employee-profile/my-profile');
    return response.data.data;
}

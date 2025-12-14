// API service for user skills CRUD operations
import api from '@/utils/api';

export interface UserSkill {
    id: number;
    userId: number;
    skillName: string;
    experience?: string;
    level?: string;
    careerGoal?: string;
    createdAt: string;
    updatedAt: string;
    certificates?: Certificate[];
}

export interface CreateUserSkillDto {
    skillName: string;
    experience?: string;
    level?: string;
    careerGoal?: string;
}

export interface UpdateUserSkillDto {
    skillName?: string;
    experience?: string;
    level?: string;
    careerGoal?: string;
}

// GET /user-skills/my-skills - Load all user skills
export async function getUserSkills(): Promise<UserSkill[]> {
    const response = await api.get('/user-skills/my-skills');
    return response.data.data || [];
}

// POST /user-skills - Create a new skill
export async function createUserSkill(data: CreateUserSkillDto): Promise<UserSkill> {
    const response = await api.post('/user-skills', data);
    return response.data.data;
}

// PATCH /user-skills/:id - Update an existing skill
export async function updateUserSkill(id: number, data: UpdateUserSkillDto): Promise<UserSkill> {
    const response = await api.patch(`/user-skills/${id}`, data);
    return response.data.data;
}

// DELETE /user-skills/:id - Delete a skill
export async function deleteUserSkill(id: number): Promise<UserSkill> {
    const response = await api.delete(`/user-skills/${id}`);
    return response.data.data;
}

export interface Certificate {
    fileName: string;
    fileUrl: string;
    careerPlanId?: number;
    uploadedAt?: string;
}

export interface CertificateResponse {
    fileName: string;
    fileUrl: string;
    careerPlanId: number;
    uploadedAt: string;
}

// GET /career-plan/my-certificates - Get all user certificates
export async function getMyCertificates(): Promise<CertificateResponse[]> {
    const response = await api.get('/career-plan/my-certificates');
    return response.data.data || [];
}

// POST /career-plan/upload-cert - Upload certificate
export async function uploadCertificate(file: File): Promise<CertificateResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/career-plan/upload-cert', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
}

// DELETE /career-plan/certificates/:id - Delete certificate (if needed)
export async function deleteCertificate(certId: number): Promise<void> {
    await api.delete(`/career-plan/certificates/${certId}`);
}

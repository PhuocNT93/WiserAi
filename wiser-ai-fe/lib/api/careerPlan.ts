import api from '@/utils/api';

export interface CareerGoal {
    title: string;
    timeframe: string;
}

export interface Competency {
    name: string;
    progress: number;
}

export interface FocusArea {
    name: string;
    priority: number;
    progress: number;
    description: string;
}

export interface ActionPlanItem {
    action: string;
    timeline: string;
    successMetrics: string;
    supportNeeded: string;
}

export interface Course {
    name: string;
    progress: number;
}

export interface Support {
    title: string;
    description: string;
}

export interface GrowthMapData {
    careerGoal: CareerGoal;
    competencies: Competency[];
    focusAreas: FocusArea[];
    actionPlan: ActionPlanItem[];
    suggestedCourses: Course[];
    supportNeeded: Support[];
}

// POST /career-plan/generate-growth-map - Generate growth map from user profile
export async function generateGrowthMap(userProfile: any): Promise<GrowthMapData> {
    const response = await api.post('/career-plan/generate-growth-map', userProfile);
    return response.data.data || response.data;
}

// GET /career-plan/latest-plan - Get latest career plan
export async function getLatestPlan(): Promise<any> {
    const response = await api.get('/career-plan/latest-plan');
    return response.data.data || response.data;
}

// GET /career-plan/my-plans - Get all my career plans
export async function getMyPlans(): Promise<any[]> {
    const response = await api.get('/career-plan/my-plans');
    return response.data.data || response.data;
}

// Helper to transform CareerPlan from DB to GrowthMapData format
export function transformPlanToGrowthMap(plan: any): GrowthMapData | null {
    if (!plan) return null;

    try {
        const careerGoal = typeof plan.careerGoal === 'string'
            ? JSON.parse(plan.careerGoal)
            : (plan.careerGoal || { title: "Not Set", timeframe: "N/A" });

        const focusAreas = typeof plan.focusAreas === 'string'
            ? JSON.parse(plan.focusAreas)
            : (plan.focusAreas || []);

        const actionPlan = typeof plan.actionPlan === 'string'
            ? JSON.parse(plan.actionPlan)
            : (plan.actionPlan || { tasks: [], courses: [], coaching: [] });

        const supportNeeded = typeof plan.supportNeeded === 'string'
            ? JSON.parse(plan.supportNeeded)
            : (plan.supportNeeded || []);

        // Generate competencies from focusAreas if not explicitly stored
        const competencies = focusAreas.map((area: any) => ({
            name: area.name,
            progress: area.progress
        }));

        // Generate suggested courses (mock data for now)
        const suggestedCourses = [
            { name: "Public Speaking", progress: 40 },
            { name: "Leadership Fundamental", progress: 30 },
            { name: "Design Thinking", progress: 50 }
        ];

        return {
            careerGoal,
            competencies,
            focusAreas,
            actionPlan,
            suggestedCourses,
            supportNeeded
        };
    } catch (error) {
        console.error('Error transforming plan:', error);
        return null;
    }
}

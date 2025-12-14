export enum ReviewPeriod {
    SIX_MONTHS = 'SIX_MONTHS',
    TWELVE_MONTHS = 'TWELVE_MONTHS',
}

export enum UserLevel {
    FRESHER = 'FRESHER',
    JUNIOR = 'JUNIOR',
    SENIOR = 'SENIOR',
    PRINCIPAL = 'PRINCIPAL'
}

export enum GrowthMapStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    BACK_TO_SUBMIT = 'BACK_TO_SUBMIT',
    SUCCESS = 'SUCCESS',
}

export interface CareerPlanCertificate {
    name: string;
    level: string;
    fileUrl?: string; // URL from backend
    file?: File; // Local file object for upload
}

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
    suggestion?: string; // Keep for backward compatibility if needed, or map 'description' to it
}

export interface ActionPlanItem {
    action: string;
    timeline: string;
    successMetrics: string;
    supportNeeded: string;
}

export interface SuggestedCourse {
    name: string;
    progress: number;
}

export interface SupportNeededItem {
    title: string;
    description: string;
}

export interface CareerPlanData {
    id?: number;
    targetLevel: UserLevel;
    reviewPeriod: ReviewPeriod;
    objectives: string;
    achievements: string;
    certificates: CareerPlanCertificate[];
    improvements: string;
    expectations: string;

    // Generated
    careerGoal?: CareerGoal;
    currentCompetencies?: Competency[]; // Changed from string
    focusAreas?: FocusArea[];
    actionPlan?: ActionPlanItem[];
    suggestedCourses?: SuggestedCourse[];
    supportNeeded?: SupportNeededItem[]; // Changed from any[]

    status?: GrowthMapStatus;
}

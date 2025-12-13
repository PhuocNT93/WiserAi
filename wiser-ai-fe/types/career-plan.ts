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
    careerGoal?: string;
    currentCompetencies?: string;
    focusAreas?: any[];
    actionPlan?: any[];
    supportNeeded?: any[];

    status?: GrowthMapStatus;
}

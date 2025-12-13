
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, GrowthMapStatus, ReviewPeriod } from '../generated/client/client';

@Injectable()
export class CareerPlanService {
    private readonly openAiApiKey: string;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) {
        this.openAiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    }

    async generateGrowthMap(userProfile: any) {
        console.log('Generating Growth Map...');
        console.log('API Key present:', !!this.openAiApiKey);
        if (this.openAiApiKey) {
            console.log('API Key length:', this.openAiApiKey.length);
            console.log('API Key first 5 chars:', this.openAiApiKey.substring(0, 5));
        }

        if (!this.openAiApiKey) {
            console.log('No OpenAI API Key found, returning mock data.');
            return this.getMockGrowthMap();
        }

        try {
            const prompt = `
                You are a senior career development expert and HR mentor.

                Generate a career growth map that can be rendered directly into a dashboard UI similar to a Growth Map overview.

                User Profile:
                ${JSON.stringify({
                ...userProfile,
                targetLevel: userProfile.targetLevel || "Not specified",
                reviewPeriod: userProfile.reviewPeriod || "Not specified"
            })}

                The response MUST be a valid JSON object following EXACTLY this structure:

                {
                "careerGoal": {
                    "title": "string",
                    "timeframe": "string"
                },

                "competencies": [
                    {
                    "name": "string",
                    "progress": number
                    }
                ],

                "focusAreas": [
                    {
                    "name": "string",
                    "priority": number,
                    "progress": number,
                    "description": "string"
                    }
                ],

                "actionPlan": [
                    {
                    "action": "string",
                    "timeline": "string",
                    "successMetrics": "string",
                    "supportNeeded": "string"
                    }
                ],

                "suggestedCourses": [
                    {
                    "name": "string",
                    "progress": number
                    }
                ],

                "supportNeeded": [
                    {
                    "title": "string",
                    "description": "string"
                    }
                ]
                }

                Rules:
                - Progress values must be numbers from 0 to 100.
                - focusAreas MUST be ordered by priority ascending (1 = highest).
                - Action plan tasks should be realistic and measurable.
                - Suggested courses should align with focus areas.
                - Keep text concise and suitable for UI cards.
                - Do NOT include markdown.
                - Return ONLY raw JSON.
                `;
            // const prompt = `You are a career development expert. Generate a detailed career growth map for the user based on their profile. User Profile: ${JSON.stringify({ ...userProfile, targetLevel: userProfile.targetLevel || 'Not specified', reviewPeriod: userProfile.reviewPeriod || 'Not specified' })} The output MUST be a valid JSON object with the following structure: { "careerGoal": "string", "currentCompetencies": "string", "focusAreas": [ { "area": "string", "priority": number, "suggestion": "string" } ], "actionPlan": [ { "action": "string", "timeline": "string", "successMetrics": "string", "supportNeeded": "string" } ], "supportNeeded": ["string"] } Do not include any markdown formatting (like \\\json). Return only the raw JSON string. `;

            console.log('Sending request to OpenAI...');
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openAiApiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that generates career plans in JSON format.',
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`OpenAI API Error: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`OpenAI API Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('OpenAI response received');
            const content = data.choices[0].message.content;

            // basic cleanup if model adds markdown blocks
            const cleanContent = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');

            return JSON.parse(cleanContent);

        } catch (error) {
            console.error('Failed to call OpenAI:', error);
            return this.getMockGrowthMap();
        }
    }

    private getMockGrowthMap() {
        return {
            "careerGoal": {
                "title": "Become Senior Developer",
                "timeframe": "12 months"
            },
            "competencies": [
                { "name": "Backend Development", "progress": 60 },
                { "name": "System Design", "progress": 25 },
                { "name": "Leadership", "progress": 78 }
            ],
            "focusAreas": [
                {
                    "name": "Leadership",
                    "priority": 1,
                    "progress": 10,
                    "description": "Improve ownership and team influence"
                },
                {
                    "name": "English Communication",
                    "priority": 2,
                    "progress": 60,
                    "description": "Improve presentation and discussion skills"
                },
                {
                    "name": "System Design",
                    "priority": 3,
                    "progress": 30,
                    "description": "Design scalable backend systems"
                }
            ],
            "actionPlan": [
                {
                    "action": "Take ownership of at least one feature module",
                    "timeline": "3 months",
                    "successMetrics": "Module delivered with < 5 bugs",
                    "supportNeeded": "Code review from senior dev"
                },
                {
                    "action": "Complete Public Speaking course",
                    "timeline": "6 months",
                    "successMetrics": "Present at 2 team meetings",
                    "supportNeeded": "Time allocation"
                },
                {
                    "action": "Lead a small feature team",
                    "timeline": "12 months",
                    "successMetrics": "Successful feature launch",
                    "supportNeeded": "Mentorship on leadership"
                }
            ],
            "suggestedCourses": [
                { "name": "Public Speaking", "progress": 40 },
                { "name": "Leadership Fundamental", "progress": 30 },
                { "name": "Design Thinking", "progress": 50 }
            ],
            "supportNeeded": [
                {
                    "title": "Manager Feedback",
                    "description": "Feedback on leadership behaviors"
                },
                {
                    "title": "Mentoring",
                    "description": "Support for decision-making and communication"
                },
                {
                    "title": "Learning Time",
                    "description": "Allocated time for completing courses"
                }
            ]
        };
    }

    async create(userId: number, data: Prisma.CareerPlanUncheckedCreateInput) {
        // Enforce Max 2 Plans Limit per Year
        const existingPlansCount = await this.prisma.careerPlan.count({
            where: {
                userId,
                year: data.year
            }
        });

        if (existingPlansCount >= 2) {
            throw new Error('Maximum 2 career plans allowed per year.');
        }

        // Normally managerId would be fetched from User's current manager
        // For now we trust the input or fetch user to get managerId
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user?.managerId) {
            data.managerId = user.managerId;
        }

        return this.prisma.careerPlan.create({
            data: {
                ...data,
                userId,
                // Ensure status is DRAFT or SUBMITTED
            },
        });
    }

    async findMyPlans(userId: number) {
        return this.prisma.careerPlan.findMany({
            where: { userId },
            orderBy: { year: 'desc' },
            include: {
                user: { select: { email: true } },
                manager: { select: { email: true } }
            }
        });
    }

    async findManagedPlans(managerId: number) {
        return this.prisma.careerPlan.findMany({
            where: { managerId },
            orderBy: { year: 'desc' },
            include: {
                user: { select: { email: true, name: true } }
            }
        });
    }

    async addManagerComment(planId: number, comments: any) {
        return this.prisma.careerPlan.update({
            where: { id: planId },
            data: { managerComments: comments }
        });
    }

    async addEmployeeComment(planId: number, comments: any) {
        return this.prisma.careerPlan.update({
            where: { id: planId },
            data: { employeeComments: comments }
        });
    }

    async updateStatus(planId: number, status: GrowthMapStatus) {
        return this.prisma.careerPlan.update({
            where: { id: planId },
            data: { status }
        });
    }
    async uploadCertificate(userId: number, certificate: { fileName: string; fileUrl: string }) {
        // Find or create a draft career plan for the user
        console.log('Uploading certificate for user:', userId, certificate);
        let careerPlan = await this.prisma.careerPlan.findFirst({
            where: {
                userId,
                status: GrowthMapStatus.DRAFT,
            },
        });

        if (!careerPlan) {
            console.log('No draft career plan found, creating a new one.');
            // Create a new draft career plan
            careerPlan = await this.prisma.careerPlan.create({
                data: {
                    userId,
                    status: GrowthMapStatus.DRAFT,
                    certificates: [certificate],
                },
            });
        } else {
            console.log('Draft career plan found, updating with new certificate.');
            // Update existing draft with new certificate
            const existingCerts = (careerPlan.certificates as any[]) || [];
            careerPlan = await this.prisma.careerPlan.update({
                where: { id: careerPlan.id },
                data: {
                    certificates: [...existingCerts, certificate],
                },
            });
        }

        return careerPlan;
    }

    async getMyCertificates(userId: number) {
        const careerPlans = await this.prisma.careerPlan.findMany({
            where: { userId },
            select: {
                id: true,
                certificates: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Extract all certificates from all career plans
        const allCertificates = careerPlans.flatMap(plan => {
            const certs = (plan.certificates as any[]) || [];
            return certs.map(cert => ({
                ...cert,
                careerPlanId: plan.id,
                uploadedAt: plan.createdAt,
            }));
        });

        return allCertificates;
    }
}

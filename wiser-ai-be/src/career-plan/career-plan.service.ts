import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, GrowthMapStatus, ReviewPeriod } from '../generated/client/client';

@Injectable()
export class CareerPlanService {
    private readonly openAiApiKey = process.env.OPENAI_API_KEY;

    constructor(private prisma: PrismaService) { }

    async generateGrowthMap(userProfile: any) {
        if (!this.openAiApiKey) {
            console.log('No OpenAI API Key found, returning mock data.');
            return this.getMockGrowthMap();
        }

        try {
            // const prompt = `
            //     You are a senior career development expert and HR mentor.

            //     Generate a career growth map that can be rendered directly into a dashboard UI similar to a Growth Map overview.

            //     User Profile:
            //     ${JSON.stringify({
            //     ...userProfile,
            //     targetLevel: userProfile.targetLevel || "Not specified",
            //     reviewPeriod: userProfile.reviewPeriod || "Not specified"
            //     })}

            //     The response MUST be a valid JSON object following EXACTLY this structure:

            //     {
            //     "careerGoal": {
            //         "title": "string",
            //         "timeframe": "string"
            //     },

            //     "competencies": [
            //         {
            //         "name": "string",
            //         "progress": number
            //         }
            //     ],

            //     "focusAreas": [
            //         {
            //         "name": "string",
            //         "priority": number,
            //         "progress": number,
            //         "description": "string"
            //         }
            //     ],

            //     "actionPlan": {
            //         "tasks": [
            //         {
            //             "description": "string"
            //         }
            //         ],
            //         "courses": [
            //         {
            //             "name": "string",
            //             "duration": "string",
            //             "type": "mandatory | optional"
            //         }
            //         ],
            //         "coaching": [
            //         {
            //             "activity": "string"
            //         }
            //         ]
            //     },

            //     "suggestedCourses": [
            //         {
            //         "name": "string",
            //         "progress": number
            //         }
            //     ],

            //     "supportNeeded": [
            //         {
            //         "title": "string",
            //         "description": "string"
            //         }
            //     ]
            //     }

            //     Rules:
            //     - Progress values must be numbers from 0 to 100.
            //     - focusAreas MUST be ordered by priority ascending (1 = highest).
            //     - Action plan tasks should be realistic and measurable.
            //     - Suggested courses should align with focus areas.
            //     - Keep text concise and suitable for UI cards.
            //     - Do NOT include markdown.
            //     - Return ONLY raw JSON.
            //     `;
            const prompt = `You are a career development expert. Generate a detailed career growth map for the user based on their profile. User Profile: ${JSON.stringify({ ...userProfile, targetLevel: userProfile.targetLevel || 'Not specified', reviewPeriod: userProfile.reviewPeriod || 'Not specified' })} The output MUST be a valid JSON object with the following structure: { "careerGoal": "string", "currentCompetencies": "string", "focusAreas": [ { "area": "string", "priority": number, "suggestion": "string" } ], "actionPlan": [ { "action": "string", "timeline": "string", "successMetrics": "string", "supportNeeded": "string" } ], "supportNeeded": ["string"] } Do not include any markdown formatting (like \\\json). Return only the raw JSON string. `;
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
                throw new Error(`OpenAI API Error: ${response.statusText}`);
            }

            const data = await response.json();
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
            "actionPlan": {
                "tasks": [
                { "description": "Take ownership of at least one feature module" },
                { "description": "Present progress in sprint reviews" },
                { "description": "Support junior teammates when possible" }
                ],
                "courses": [
                {
                    "name": "Effective Communication",
                    "duration": "6 hours",
                    "type": "mandatory"
                },
                {
                    "name": "Intro to Project Planning",
                    "duration": "Optional",
                    "type": "optional"
                }
                ],
                "coaching": [
                { "activity": "Monthly 1:1 career discussion" },
                { "activity": "Request feedback after each milestone" }
                ]
            },
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
        });
    }
}

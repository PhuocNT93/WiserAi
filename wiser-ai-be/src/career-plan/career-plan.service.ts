import { Injectable } from '@nestjs/common';

@Injectable()
export class CareerPlanService {
    private readonly openAiApiKey = process.env.OPENAI_API_KEY;

    async generateGrowthMap(userProfile: any) {
        if (!this.openAiApiKey) {
            console.log('No OpenAI API Key found, returning mock data.');
            return this.getMockGrowthMap();
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openAiApiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o', // or gpt-3.5-turbo
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a career development expert. Generate a growth map with milestones based on the user profile.',
                        },
                        {
                            role: 'user',
                            content: JSON.stringify(userProfile),
                        },
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error(`OpenAI API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                source: 'openai',
                content: data.choices[0].message.content,
            };

        } catch (error) {
            console.error('Failed to call OpenAI:', error);
            return this.getMockGrowthMap();
        }
    }

    private getMockGrowthMap() {
        return {
            source: 'mock',
            milestones: [
                {
                    id: 1,
                    title: 'Q1: Foundation',
                    description: 'Master core Next.js concepts and TypeScript.',
                    status: 'IN_PROGRESS',
                },
                {
                    id: 2,
                    title: 'Q2: Advanced Logic',
                    description: 'Deep dive into NestJS backend patterns.',
                    status: 'PENDING',
                },
                {
                    id: 3,
                    title: 'Q3: Leadership',
                    description: 'Mentor junior developers and lead a small project.',
                    status: 'PENDING',
                },
            ],
        };
    }
}

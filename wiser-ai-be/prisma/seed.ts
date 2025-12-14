import { PrismaClient, Role, GrowthMapStatus, ReviewPeriod } from '../src/generated/client/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// Force load env if not loaded
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wiser_ai?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    const adminEmail = 'admin@wiserai.com';
    const managerEmail = 'anh.le@cyberlogitec.com';
    const employeeEmail = 'linh.nguyen@cyberlogitec.com';

    // Cleanup potential conflicts
    await prisma.user.deleteMany({
        where: {
            email: {
                in: [
                    'linh.nguyen@cyberlogitec.com.vn', // potential old wrong domain
                    'aanh.le@cyberlogitec.com', // potential typo
                ]
            }
        }
    });

    const password = '12345tp';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: 'Admin User',
            password: hashedPassword,
            roles: [Role.ADMIN],
        },
    });

    const manager = await prisma.user.upsert({
        where: { email: managerEmail },
        update: {},
        create: {
            email: managerEmail,
            name: 'Anh Le',
            password: hashedPassword,
            roles: [Role.MANAGER],
        },
    });

    const employee = await prisma.user.upsert({
        where: { email: employeeEmail },
        update: {},
        create: {
            email: employeeEmail,
            name: 'Nguyen Thi Linh',
            manager: { connect: { id: manager.id } },
            password: hashedPassword,
            roles: [Role.MEMBER],
        },
    });

    console.log({ admin });
    console.log({ manager });
    console.log({ employee });

    // Seed Career Plans for 2023, 2024, 2025
    const years = [2023, 2024, 2025];
    const planData = {
        careerGoal: {
            title: "Become Senior Developer",
            timeframe: "12 months"
        },
        currentCompetencies: [
            { name: "Backend Development", progress: 60 },
            { name: "System Design", progress: 25 },
            { name: "Leadership", progress: 78 }
        ],
        focusAreas: [
            {
                name: "Leadership",
                priority: 1,
                progress: 10,
                description: "Improve ownership and team influence"
            },
            {
                name: "English Communication",
                priority: 2,
                progress: 60,
                description: "Improve presentation and discussion skills"
            },
            {
                name: "System Design",
                priority: 3,
                progress: 30,
                description: "Design scalable backend systems"
            }
        ],
        actionPlan: [
            {
                action: "Take ownership of at least one feature module",
                timeline: "3 months",
                successMetrics: "Module delivered with < 5 bugs",
                supportNeeded: "Code review from senior dev"
            },
            {
                action: "Complete Public Speaking course",
                timeline: "6 months",
                successMetrics: "Present at 2 team meetings",
                supportNeeded: "Time allocation"
            },
            {
                action: "Lead a small feature team",
                timeline: "12 months",
                successMetrics: "Successful feature launch",
                supportNeeded: "Mentorship on leadership"
            }
        ],
        suggestedCourses: [
            { name: "Public Speaking", progress: 40 },
            { name: "Leadership Fundamental", progress: 30 },
            { name: "Design Thinking", progress: 50 }
        ],
        supportNeeded: [
            {
                title: "Manager Feedback",
                description: "Feedback on leadership behaviors"
            },
            {
                title: "Mentoring",
                description: "Support for decision-making and communication"
            },
            {
                title: "Learning Time",
                description: "Allocated time for completing courses"
            }
        ],
        objectives: "Become a key contributor and leader.",
        achievements: "Delivered multiple modules on time.",
        improvements: "Need to improve public speaking.",
        expectations: "Expect to lead a team soon."
    };

    // Cleanup existing plans for these years
    await prisma.careerPlan.deleteMany({
        where: {
            userId: employee.id,
            year: { in: years }
        }
    });

    for (const year of years) {
        await prisma.careerPlan.create({
            data: {
                userId: employee.id,
                managerId: manager.id,
                year: year,
                reviewPeriod: 'SIX_MONTHS', // Assuming default from enum
                status: 'SUBMITTED',
                ...planData
            }
        });
        console.log(`Seeded career plan for ${year}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

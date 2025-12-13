import { PrismaClient, Role } from '../src/generated/client/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    const adminEmail = 'admin';

    const password = '12345tp';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@wiserai.com' },
        update: {},
        create: {
            email: 'admin@wiserai.com',
            name: 'Admin User',
            password: hashedPassword,
            roles: [Role.ADMIN],
        },
    });

    console.log({ admin });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

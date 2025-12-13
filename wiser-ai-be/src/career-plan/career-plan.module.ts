import { Module } from '@nestjs/common';
import { CareerPlanController } from './career-plan.controller';
import { CareerPlanService } from './career-plan.service';
import { PrismaService } from '../prisma/prisma.service'; // Assuming global or shared
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
    imports: [
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    ],
    controllers: [CareerPlanController],
    providers: [CareerPlanService, PrismaService], // Ensure PrismaService is available
})
export class CareerPlanModule { }

import { Module } from '@nestjs/common';
import { CareerPlanController } from './career-plan.controller';
import { CareerPlanService } from './career-plan.service';
import { PrismaService } from '../prisma/prisma.service'; // Assuming global or shared
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';

@Module({
    imports: [
        MulterModule.register({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    // Check if this is a certificate upload
                    let uploadPath: string;
                    if (req.path.includes('upload-cert')) {
                        uploadPath = './uploads/certificates';
                    } else {
                        uploadPath = './uploads';
                    }
                    // Create directory if it doesn't exist
                    mkdirSync(uploadPath, { recursive: true });
                    cb(null, uploadPath);
                },
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

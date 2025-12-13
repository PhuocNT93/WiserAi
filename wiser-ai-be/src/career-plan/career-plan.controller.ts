import { Controller, Get, Post, Body, Patch, Param, UseInterceptors, UploadedFile, Req, UseGuards } from '@nestjs/common';
import { CareerPlanService } from './career-plan.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard)

@Controller('career-plan')
export class CareerPlanController {
    constructor(private readonly careerPlanService: CareerPlanService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        // Return the path/url to the file
        // In production, you'd map this to a static serve path or CDN
        // Here we assume a static serve middleware serves 'uploads' folder or we just return the local path
        return {
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            url: `/uploads/${file.filename}` // Assuming frontend can access this via a ServeStatic setup
        };
    }

    @Post('upload-cert')
    @UseInterceptors(FileInterceptor('file'))
    async uploadCert(
        @Req() req: any,
        @UploadedFile() file: Express.Multer.File
    ) {
        const userId = req.user.id;
        const fileUrl = `/uploads/certificates/${file.filename}`;

        return this.careerPlanService.uploadCertificate(userId, {
            fileName: file.originalname,
            fileUrl
        });
    }

    @Post('generate-growth-map')
    async generate(@Body() body: any) {
        return this.careerPlanService.generateGrowthMap(body);
    }

    @Post()
    async create(@Req() req: any, @Body() createCareerPlanDto: any) {
        const userId = req.user.id;
        return this.careerPlanService.create(userId, createCareerPlanDto);
    }

    @Get('my-plans')
    async findMyPlans(@Req() req: any) {
        const userId = req.user.id;
        return this.careerPlanService.findMyPlans(userId);
    }

    @Get('team-plans')
    async findManagedPlans(@Req() req: any) {
        const managerId = req.user.id;
        return this.careerPlanService.findManagedPlans(managerId);
    }

    @Post(':id/comment')
    async addComment(@Param('id') id: string, @Body() body: any) {
        return this.careerPlanService.addManagerComment(+id, body);
    }

    @Post(':id/employee-comment')
    async addEmployeeComment(@Param('id') id: string, @Body() body: any) {
        return this.careerPlanService.addEmployeeComment(+id, body);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: any) {
        return this.careerPlanService.updateStatus(+id, status);
    }

    @Get('my-certificates')
    async getMyCertificates(@Req() req: any) {
        const userId = req.user.id;
        return this.careerPlanService.getMyCertificates(userId);
    }
}

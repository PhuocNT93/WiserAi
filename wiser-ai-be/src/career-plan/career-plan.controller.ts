import { Controller, Post, Body } from '@nestjs/common';
import { CareerPlanService } from './career-plan.service';

@Controller('career-plan')
export class CareerPlanController {
    constructor(private readonly careerPlanService: CareerPlanService) { }

    @Post('generate-growth-map')
    generateGrowthMap(@Body() userProfile: any) {
        return this.careerPlanService.generateGrowthMap(userProfile);
    }
}

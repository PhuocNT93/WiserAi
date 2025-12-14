import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Req, UseGuards } from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.services';
import { Prisma } from '../generated/client/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// Note: FileInterceptor logic requires @nestjs/platform-express and handling multer, 
// keeping it simple for now or adding if requested.

@UseGuards(JwtAuthGuard)
@Controller('employee-profile')
export class EmployeeProfileController {
    constructor(private readonly employeeProfileController: EmployeeProfileService) { }

    @Post()
    create(@Body() createEmployeeProfileDto: Prisma.EmployeeProfileCreateInput) {
        return this.employeeProfileController.create(createEmployeeProfileDto);
    }

    @Get()
    findAll() {
        return this.employeeProfileController.findAll();
    }

    @Get('my-profile')
    getMyProfile(@Req() req: any) {
        const userEmail = req.user.email;
        return this.employeeProfileController.getProfileByEmail(userEmail);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.employeeProfileController.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEmployeeProfileDto: Prisma.EmployeeProfileUpdateInput) {
        return this.employeeProfileController.update(+id, updateEmployeeProfileDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.employeeProfileController.remove(+id);
    }

    @Post('import')
    // @UseInterceptors(FileInterceptor('file')) // would need dependency
    importExcel(@Body() body: any) {
        // Check if body has file data or just handle simple JSON for now
        return this.employeeProfileController.importFromExcel(body);
    }
}

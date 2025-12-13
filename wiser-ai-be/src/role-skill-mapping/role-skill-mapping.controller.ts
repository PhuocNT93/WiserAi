import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { RoleSkillMappingService } from './role-skill-mapping.services';
import { Prisma } from '../generated/client/client';
// Note: FileInterceptor logic requires @nestjs/platform-express and handling multer, 
// keeping it simple for now or adding if requested.

@Controller('role-skill-mapping')
export class RollSkillMappingController {
    constructor(private readonly roleSkillMappingController: RoleSkillMappingService) { }

    @Post()
    create(@Body() createRoleSkillMappingDto: Prisma.RoleSkillMappingCreateInput) {
        return this.roleSkillMappingController.create(createRoleSkillMappingDto);
    }

    @Get()
    findAll() {
        return this.roleSkillMappingController.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.roleSkillMappingController.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateRoleSkillMappingDto: Prisma.RoleSkillMappingUpdateInput) {
        return this.roleSkillMappingController.update(+id, updateRoleSkillMappingDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.roleSkillMappingController.remove(+id);
    }

    @Post('import')
    // @UseInterceptors(FileInterceptor('file')) // would need dependency
    importExcel(@Body() body: any) {
        // Check if body has file data or just handle simple JSON for now
        return this.roleSkillMappingController.importFromExcel(body);
    }
}

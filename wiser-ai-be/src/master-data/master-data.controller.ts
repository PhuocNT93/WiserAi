import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { Prisma } from '../generated/client/client';
// Note: FileInterceptor logic requires @nestjs/platform-express and handling multer, 
// keeping it simple for now or adding if requested.

@Controller('master-data')
export class MasterDataController {
    constructor(private readonly masterDataService: MasterDataService) { }

    @Post()
    create(@Body() createMasterDatumDto: Prisma.MasterDataCreateInput) {
        return this.masterDataService.create(createMasterDatumDto);
    }

    @Get()
    findAll() {
        return this.masterDataService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.masterDataService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMasterDatumDto: Prisma.MasterDataUpdateInput) {
        return this.masterDataService.update(+id, updateMasterDatumDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.masterDataService.remove(+id);
    }

    @Post('import')
    // @UseInterceptors(FileInterceptor('file')) // would need dependency
    importExcel(@Body() body: any) {
        // Check if body has file data or just handle simple JSON for now
        return this.masterDataService.importFromExcel(body);
    }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ConfigDataService } from './config-data.service';
import { CreateConfigDatumDto } from './dto/create-config-datum.dto';
import { UpdateConfigDatumDto } from './dto/update-config-datum.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport'; // Or make it public? User didn't specify. Assuming protected.

@ApiTags('Config Data')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('config-data')
export class ConfigDataController {
  constructor(private readonly configDataService: ConfigDataService) { }

  @ApiOperation({ summary: 'Create config' })
  @Post()
  create(@Body() createConfigDatumDto: CreateConfigDatumDto) {
    return this.configDataService.create(createConfigDatumDto);
  }

  @ApiOperation({ summary: 'Get all configs' })
  @Get()
  findAll() {
    return this.configDataService.findAll();
  }

  @ApiOperation({ summary: 'Update config' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConfigDatumDto: UpdateConfigDatumDto) {
    return this.configDataService.update(+id, updateConfigDatumDto);
  }

  @ApiOperation({ summary: 'Delete config' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configDataService.remove(+id);
  }
}

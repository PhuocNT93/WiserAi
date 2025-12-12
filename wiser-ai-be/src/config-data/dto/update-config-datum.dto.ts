import { PartialType } from '@nestjs/swagger';
import { CreateConfigDatumDto } from './create-config-datum.dto';

export class UpdateConfigDatumDto extends PartialType(CreateConfigDatumDto) {}

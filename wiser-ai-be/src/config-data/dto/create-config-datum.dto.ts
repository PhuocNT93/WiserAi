import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConfigDatumDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    value: string;
}

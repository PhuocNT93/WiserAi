import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserSkillDto {
    @IsString()
    @IsNotEmpty()
    skillName: string;

    @IsString()
    @IsOptional()
    experience?: string;

    @IsString()
    @IsOptional()
    level?: string;

    @IsString()
    @IsOptional()
    careerGoal?: string;
}

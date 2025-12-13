import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
    @ApiProperty({ example: 'test@example.com', description: 'The email of the user' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', description: 'The password of the user', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

export class CreateAuthDto extends AuthDto {
    @ApiProperty({ example: 'John Doe', description: 'The full name of the user' })
    @IsString()
    @IsNotEmpty()
    name: string;
}

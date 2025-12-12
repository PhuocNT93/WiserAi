import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

export class CreateAuthDto extends AuthDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}

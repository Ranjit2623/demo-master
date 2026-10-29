
import { IsEmail, IsString, MaxLength, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsEmail()
    @MaxLength(150)
    @IsNotEmpty()
    email: string;

    @IsString()
    @MaxLength(72)
    @MinLength(8)
    @IsNotEmpty()
    password: string;
}


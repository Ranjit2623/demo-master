
import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
} from 'class-validator';

export class RegisterDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsEmail()
    @MaxLength(150)
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password: string;
}

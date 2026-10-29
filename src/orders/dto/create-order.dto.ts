import {
    IsEmail,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    customerName: string;

    @IsEmail()
    @MaxLength(255)
    customerEmail: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    productName: string;

    @IsInt()
    @IsPositive()
    quantity: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    totalAmount: number;
}


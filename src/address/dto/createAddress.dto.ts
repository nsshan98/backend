import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  shipping_address: string;

  @IsString()
  @IsNotEmpty()
  shipping_phone_number: string;

  @IsString()
  @IsOptional()
  shipping_email?: string;

  @IsString()
  @IsOptional()
  shipping_line1?: string;

  @IsString()
  @IsOptional()
  shipping_city?: string;

  @IsString()
  @IsOptional()
  shipping_district?: string;

  @IsString()
  @IsOptional()
  shipping_instructions?: string;
}

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  line1?: string;

  @IsString()
  @IsOptional()
  line2?: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsOptional()
  upazila?: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsString()
  @IsNotEmpty()
  post_code: string;

  @IsString()
  @IsNotEmpty()
  country?: string;

  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  @IsOptional()
  longitude?: string;

  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}

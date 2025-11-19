import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ParseBoolean } from 'src/common/decorator/transform.decorator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  stock_quantity: number;

  @IsNumber()
  @IsNotEmpty()
  cost_price: number;

  @IsNumber()
  @IsNotEmpty()
  regular_price: number;

  @IsNumber()
  @IsOptional()
  sale_price: number;

  @ParseBoolean()
  @IsBoolean()
  @IsNotEmpty()
  is_published: boolean;
}

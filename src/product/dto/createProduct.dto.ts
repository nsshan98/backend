import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  stock_quantity: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  cost_price: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  regular_price: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  sale_price?: number;

  @ParseBoolean()
  @IsBoolean()
  @IsNotEmpty()
  is_published: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as string[];
      } catch {
        return value; // let validation fail naturally
      }
    }
    return value as string[];
  })
  category_ids?: string[];
}

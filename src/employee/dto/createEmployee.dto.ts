import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ToBoolean } from 'src/common/decorator/transformer';
import { Departments } from '../enum/departmentTypes.enum';
import { ParseBoolean } from 'src/common/decorator/transform.decorator';

class ImageDto {
  @IsString()
  @IsNotEmpty()
  image_url: string;

  @IsString()
  @IsNotEmpty()
  image_public_id: string;
}

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  email: string;

  // @IsBoolean()
  // @ToBoolean()
  @ParseBoolean()
  @IsBoolean()
  show_email: boolean;

  @IsString()
  @IsOptional()
  official_phone: string;

  @IsBoolean()
  @ToBoolean()
  show_official_phone: boolean;

  @IsString()
  @IsOptional()
  personal_phone: string;

  @IsBoolean()
  @ToBoolean()
  show_personal_phone: boolean;

  @IsString()
  @IsNotEmpty()
  designation: string;

  @IsEnum(Departments)
  @IsNotEmpty()
  department: Departments;

  @IsNumber()
  @IsOptional()
  sorting_order?: number;

  @IsBoolean()
  @ToBoolean()
  is_published: boolean;

  @ValidateNested()
  @Type(() => ImageDto)
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  image?: ImageDto | null;
}

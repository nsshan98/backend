import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ParseBoolean } from 'src/common/decorator/transform.decorator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ParseBoolean()
  @IsBoolean()
  @IsNotEmpty()
  is_published: boolean;
}

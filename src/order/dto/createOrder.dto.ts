import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/createAddress.dto';

export class OrderItemDto {
  @IsUUID()
  product_id: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  idempotency_key: string;

  @ValidateNested()
  @Type(() => CreateAddressDto)
  shipping_address: CreateAddressDto;

  @Type(() => Number)
  @IsNumber()
  shipping_cost: number;

  @Type(() => Number)
  @IsNumber()
  tax_total: number;

  @Type(() => Number)
  @IsNumber()
  discount_total: number;

  @IsBoolean()
  @IsOptional()
  should_save_address?: boolean;

  @IsString()
  @IsOptional()
  shipping_instructions?: string;
}

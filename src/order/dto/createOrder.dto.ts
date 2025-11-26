import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from 'src/address/dto/createAddress.dto';

export class OrderItemDto {
  @IsUUID()
  product_id: string;

  @IsString()
  product_name: string;

  @IsString()
  product_image: string;

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

  @Type(() => Number)
  @IsNumber()
  total: number;
}

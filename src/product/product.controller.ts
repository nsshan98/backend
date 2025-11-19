import { Controller, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enum/role.enum';
import { Public } from 'src/auth/decorators/public.decorators';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  //   @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Public()
  @Post('create')
  createProduct() {
    return 'Product created successfully';
  }
}

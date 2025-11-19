import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/db/db.service';

@Injectable()
export class ProductService {
  constructor(private readonly dbService: DrizzleService) {}

  createProduct() {
    // Business logic for creating a product would go here
    return 'Product created successfully';
  }
}

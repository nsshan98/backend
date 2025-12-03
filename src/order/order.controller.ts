import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enum/role.enum';
import { CreateOrderDto } from './dto/createOrder.dto';
import { AuthenticatedUser } from 'src/auth/decorators/authenticated-user.decorators';
import { users } from 'src/db/schema';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Post('create')
  createOrder(
    @Body() dto: CreateOrderDto,
    @AuthenticatedUser() user: typeof users.$inferSelect,
  ) {
    return this.orderService.createOrder(dto, user);
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Get('all')
  getAllOrders() {
    return this.orderService.getAllOrders();
  }
}

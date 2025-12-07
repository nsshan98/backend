import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enum/role.enum';
import { CreateOrderDto } from './dto/createOrder.dto';
import { AuthenticatedUser } from 'src/auth/decorators/authenticated-user.decorators';
import { users } from 'src/db/schema';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { PagePaginationDto } from 'src/common/dto/page-pagination.dto';

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

  @Roles(Role.SUPPA_DUPPA_ADMIN, Role.USER)
  @Get('all-by-user')
  getAllOrdersByUser(
    @Query() query: CursorPaginationDto,
    @AuthenticatedUser() user: typeof users.$inferSelect,
  ) {
    return this.orderService.getAllOrdersByUser(query, user);
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Get('all-orders')
  getOrders(@Query() query: PagePaginationDto) {
    return this.orderService.getOrders(query);
  }
}

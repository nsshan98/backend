import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { DbModule } from './db/db.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { OrderModule } from './order/order.module';
import { AddressController } from './address/address.controller';
import { AddressService } from './address/address.service';
import { AddressModule } from './address/address.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    DbModule,
    UserModule,
    EmployeeModule,
    ProductModule,
    CategoryModule,
    AuthModule,
    OrderModule,
    AddressModule,
  ],
  controllers: [AppController, OrderController, AddressController],
  providers: [AppService, OrderService, AddressService],
})
export class AppModule {}

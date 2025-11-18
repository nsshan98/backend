import { Module } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule, CloudinaryModule],
  controllers: [EmployeeController],
  providers: [EmployeeService, CloudinaryService],
})
export class EmployeeModule {}

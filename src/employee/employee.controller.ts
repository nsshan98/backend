import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enum/role.enum';
import { AuthenticatedUser } from 'src/auth/decorators/authenticated-user.decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ImageUploadValidationPipe } from 'src/cloudinary/pipes/image-validation.pipe';
import { UploadApiResponse } from 'cloudinary';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/createEmployee.dto';
import { UpdateEmployeeDto } from './dto/updateEmployee.dto';
import { Public } from 'src/auth/decorators/public.decorators';
import { InferModel } from 'drizzle-orm';
import { users } from 'src/db/schema';
// import { ParseJsonFieldsPipe } from 'src/common/pipes/parse-json-fields.pipe';

@Controller('employee')
export class EmployeeController {
  constructor(
    private employeeService: EmployeeService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Roles(Role.USER)
  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  async createEmployee(
    @Body() dto: CreateEmployeeDto,
    @UploadedFile(new ImageUploadValidationPipe({ required: false }))
    image: Express.Multer.File | null,
    @AuthenticatedUser() user: InferModel<typeof users, 'select'>,
  ) {
    // if (!image) throw new BadRequestException('Image is required');

    if (image) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        image,
        dto.department,
      );
      if (uploadResult) {
        dto.image = {
          image_url: uploadResult.secure_url,
          image_public_id: uploadResult.public_id,
        };
      }
    } else {
      dto.image = null; // ✅ explicitly set null if no image uploaded
    }

    return this.employeeService.createEmployee(dto, user);
  }

  @Roles(Role.USER)
  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateEmployee(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEmployeeDto,
    @UploadedFile(new ImageUploadValidationPipe({ required: false }))
    updatedImage: Express.Multer.File | null,
    @AuthenticatedUser() user: InferModel<typeof users, 'select'>,
  ) {
    const existingEmployee = await this.employeeService.findOneWithId(id);
    if (!existingEmployee) throw new NotFoundException('Employee not found');

    if (existingEmployee?.user_id !== user.id)
      throw new ForbiddenException(
        'You are not allowed to update this employee',
      );
    let uploadResult: UploadApiResponse | null = null;

    try {
      if (updatedImage) {
        uploadResult = await this.cloudinaryService.uploadImage(
          updatedImage,
          dto.department,
        );

        dto.image = {
          image_url: uploadResult?.secure_url as string,
          image_public_id: uploadResult?.public_id as string,
        };
      }

      // Inside updateEmployee
      if (!updatedImage && dto.image === null) {
        // User explicitly wants to remove image
        if (existingEmployee.image?.image_public_id) {
          await this.cloudinaryService
            .deleteImage(existingEmployee.image.image_public_id)
            .catch(() => {});
        }
        dto.image = null;
      } else if (!updatedImage && dto.image === undefined) {
        // User did not send anything about image → keep existing
        delete dto.image;
      }

      const updatedEmployee = await this.employeeService.updateEmployee(
        id,
        dto,
      );

      if (updatedImage && existingEmployee?.image?.image_public_id) {
        await this.cloudinaryService
          .deleteImage(existingEmployee.image.image_public_id)
          .catch((err) => console.warn('Failed to delete old image:', err));
      }

      // console.log(updatedEmployee);

      return {
        message: 'Employee Updated Successfully',
        data: updatedEmployee,
      };
    } catch (error) {
      console.error('Error updating employee:', error);
      if (uploadResult && uploadResult.public_id) {
        await this.cloudinaryService
          .deleteImage(uploadResult.public_id)
          .catch(() => {});
      }
    }
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Delete('delete/:id')
  async deleteEmployee(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthenticatedUser() user: InferModel<typeof users, 'select'>,
  ) {
    const getEmployee = await this.employeeService.findOneWithId(id);
    if (user.id !== getEmployee?.user_id) {
      throw new ForbiddenException(
        'You are not allowed to update this employee',
      );
    }
    if (getEmployee?.image) {
      await this.cloudinaryService.deleteImage(
        getEmployee.image.image_public_id,
      );
    }
    await this.employeeService.deleteEmployee(id);
    return { message: 'Employee Deleted Successfully' };
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Get('all-employees')
  async getAllEmployees() {
    const allEmployees = await this.employeeService.getAllEmployees();
    return {
      message: 'All Employees Fetched Successfully',
      data: allEmployees,
    };
  }

  @Public()
  @Get('show-all-employees')
  async showAllEmployees() {
    const allEmployees = await this.employeeService.showAllEmployees();
    return {
      message: 'All Employees Fetched Successfully',
      data: allEmployees,
    };
  }

  @Public()
  @Get('departments')
  async getDepartments() {
    const departments = await this.employeeService.getAllDepartments();
    return {
      message: 'All Departments Fetched Successfully',
      count: departments.length,
      data: departments,
    };
  }

  @Public()
  @Get('offices')
  async getOffices() {
    const offices = await this.employeeService.getAllOffices();
    return {
      message: 'All Offices Fetched Successfully',
      count: offices.length,
      data: offices,
    };
  }

  @Public()
  @Get('department/:department')
  async getEmployeesByDepartment(@Param('department') department: string) {
    const employees =
      await this.employeeService.getEmployeesByDepartment(department);
    return {
      message: `${department}`,
      count: employees.length,
      data: employees,
    };
  }

  @Public()
  @Get('office/:office')
  async getEmployeesByOffice(@Param('office') office: string) {
    const employees = await this.employeeService.getEmployeesByOffice(office);
    return {
      message: `${office}`,
      count: employees.length,
      data: employees,
    };
  }
}

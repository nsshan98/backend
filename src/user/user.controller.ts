import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth/jwt-auth.guard';
import { Role } from 'src/auth/enum/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Public } from 'src/auth/decorators/public.decorators';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Public()
  @Post('signup')
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getUserById(@Req() req: { user: { userId: string } }) {
    return this.userService.getSingleUser(req.user.userId);
  }

  @Get()
  getAllUsers(@Query() paginationDto: PaginationDto) {
    // console.log(paginationDto);
    return this.userService.getAllUsers(paginationDto);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, dto);
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: string) {
    await this.userService.deleteUser(id);

    return {
      message: 'User Deleted',
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from 'src/db/db.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { users } from 'src/db/schema/user';
import { eq } from 'drizzle-orm';
import { PaginationDto } from './dto/pagination.dto';
import { DEFAULT_PAGINATION_LIMIT } from 'src/utils/constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly dbService: DrizzleService) {}

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1) // select one row
      .execute();

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    if (existingUser.length > 0) {
      throw new NotFoundException('User with this email already exists');
    }

    const [user] = await this.dbService.db
      .insert(users)
      .values({ ...dto, password: hashedPassword })
      .returning()
      .execute();

    return {
      message: 'User created successfully',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getSingleUser(id: string) {
    const userInfo = await this.dbService.db
      .select({
        id: users.id,
        role: users.role,
        hashed_refresh_token: users.hashed_refresh_token,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .execute();

    if (!userInfo[0]) {
      throw new NotFoundException('User not found');
    }

    return userInfo[0];
  }

  async getAllUsers(paginationDto: PaginationDto) {
    return await this.dbService.db
      .select()
      .from(users)
      .limit(paginationDto.limit ?? DEFAULT_PAGINATION_LIMIT)
      .offset(paginationDto.skip)
      .execute();
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const [updatedUser] = await this.dbService.db
      .update(users)
      .set(dto)
      .where(eq(users.id, id))
      .returning()
      .execute();

    return updatedUser;
  }

  async deleteUser(id: string) {
    await this.dbService.db.delete(users).where(eq(users.id, id)).execute();
    return { message: 'User Deleted' };
  }

  async findUserByEmail(email: string) {
    const usersFound = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .execute();

    return usersFound[0] ?? null;
  }

  async updateHashedRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ) {
    await this.dbService.db
      .update(users)
      .set({ hashed_refresh_token: hashedRefreshToken })
      .where(eq(users.id, userId))
      .execute();
  }
}

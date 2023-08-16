import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { FilterDto, ResponseDto } from '../models';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { exclude } from '../models/helpers';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  private async validateReferences(
    data: CreateUserDto | UpdateUserDto,
    id: number,
  ) {
    if (data.email) {
      const existUsername = await this.findDuplicateEmail({
        email: data.email,
        id,
      });
      if (existUsername) {
        throw new HttpException(
          'User email alredy registered',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return data;
  }

  async create(params: CreateUserDto): Promise<Partial<User>> {
    try {
      const hashPassword = await bcrypt.hash(params.password, 10);
      const data: Prisma.UserCreateInput = {
        ...params,
        password: hashPassword,
      };

      await this.validateReferences(data, 0);
      const user = await this.prismaService.user.create({
        data,
      });

      return exclude(user, ['password']);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds all users, with optional pagination and filters.
   *
   * @param {FilterDto} params - Optional filters for the user search.
   * @returns {Promise<ResponseDto<Partial<User>>>} A paginated list of users.
   */
  async findAll(params?: FilterDto): Promise<ResponseDto<Partial<User>>> {
    const { pageSize = 20, current = 1, name } = params;

    const options: {
      skip?: number;
      take?: number;
      cursor?: Prisma.UserWhereUniqueInput;
      where?: Prisma.UserWhereInput;
      orderBy?: Prisma.UserOrderByWithRelationInput;
      select: Prisma.UserSelect;
    } = {
      take: pageSize,
      skip: (current - 1) * pageSize,
      select: {
        id: true,
        email: true,
        name: true,
      },
    };

    if (name) {
      options.where = {
        OR: [
          {
            name: {
              contains: `${name}`,
            },
          },
          {
            email: {
              contains: `${name}`,
            },
          },
        ],
      };
    }

    const userCount = await this.prismaService.user.count();

    const result: Partial<User>[] = await this.prismaService.user.findMany(
      options,
    );

    return {
      data: result,
      current,
      pageSize,
      success: true,
      total: userCount,
    };
  }

  async findOne(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<Partial<User> | null> {
    const user = await this.prismaService.user.findUnique({ where });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return exclude(user, ['password']);
  }

  private async findDuplicateEmail(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User> {
    return await this.prismaService.user.findFirst({
      where: {
        email: userWhereUniqueInput.email,
        NOT: {
          id: userWhereUniqueInput.id,
        },
      },
    });
  }

  async findByEmail(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User> {
    return await this.prismaService.user.findFirst({
      where: {
        email: userWhereUniqueInput.email,
      },
    });
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: UpdateUserDto;
  }): Promise<User> {
    try {
      const { data, where } = params;
      await this.findOne(where);

      const newData = { ...data };

      if (data.password) {
        newData.password = await bcrypt.hash(data.password, 10);
      }

      await this.validateReferences(newData, where.id);

      return this.prismaService.user.update({
        data: newData,
        where,
      });
    } catch (error) {
      throw error;
    }
  }

  private async remove(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prismaService.user.delete({
      where,
    });
  }

  async batchRemove({ key }: { key: number[] }) {
    try {
      return await this.prismaService.$transaction(async () => {
        await key.reduce(async (antPromise, item) => {
          await antPromise;
          const user = await this.findOne({ id: item });
          await this.remove({ id: item });
        }, Promise.resolve());
      });
    } catch (err) {
      console.log('Delete Users transaction failed');
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}

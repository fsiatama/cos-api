import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Applicant } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { UsersService } from '../users/users.service';
import { ApplicantDto, FilterDto, ResponseDto } from '../models';
import { exclude } from '../models/helpers';

@Injectable()
export class ApplicantsService {
  constructor(
    private prismaService: PrismaService,
    private usersService: UsersService,
  ) {}
  async create(params: ApplicantDto, createdBy: string) {
    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const applicantRole = await prisma.role.findUnique({
          where: {
            name: 'APPLICANT',
          },
        });

        const user = await this.usersService.create({
          email: params.email,
          name: params.name,
          password: params.password,
          roles: [applicantRole.id],
        });

        const applicant = await prisma.applicant.create({
          data: {
            user: {
              connect: { id: user.id },
            },
          },
        });

        return applicant;
      });
    } catch (err) {
      console.log('Create Applicant transaction failed');
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async findAllNames(params?: FilterDto) {
    const { pageSize = 20, current = 1, name } = params;

    const options: {
      skip?: number;
      take?: number;
      cursor?: Prisma.ApplicantWhereUniqueInput;
      where?: Prisma.ApplicantWhereInput;
      orderBy?: Prisma.ApplicantOrderByWithRelationInput;
      select: Prisma.ApplicantSelect;
    } = {
      take: pageSize,
      skip: (current - 1) * pageSize,
      orderBy: {
        user: {
          name: 'asc',
        },
      },
      select: {
        id: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    };

    if (name) {
      options.where = {
        user: {
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
        },
      };
    }

    return this.prismaService.applicant.findMany(options);
  }

  async findAll(params?: FilterDto): Promise<ResponseDto<Partial<Applicant>>> {
    const { pageSize = 20, current = 1, name } = params;

    const options: {
      skip?: number;
      take?: number;
      cursor?: Prisma.ApplicantWhereUniqueInput;
      where?: Prisma.ApplicantWhereInput;
      orderBy?: Prisma.ApplicantOrderByWithRelationInput;
      select: Prisma.ApplicantSelect;
    } = {
      take: pageSize,
      skip: (current - 1) * pageSize,
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    };

    if (name) {
      options.where = {
        user: {
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
        },
      };
    }

    const userCount = await this.prismaService.applicant.count({
      where: options.where,
    });

    const result: Partial<Applicant>[] =
      await this.prismaService.applicant.findMany(options);

    return {
      data: result,
      current,
      pageSize,
      success: true,
      total: userCount,
    };
  }

  async findOne(
    where: Prisma.ApplicantWhereUniqueInput,
  ): Promise<Partial<Applicant> | null> {
    const applicant = await this.prismaService.applicant.findUnique({ where });

    if (!applicant) {
      throw new HttpException('Applicant not found', HttpStatus.NOT_FOUND);
    }
    return exclude(applicant, []);
  }

  update(id: number, updateApplicantDto: UpdateApplicantDto) {
    return `This action updates a #${id} applicant`;
  }

  remove(id: number) {
    return `This action removes a #${id} applicant`;
  }
}

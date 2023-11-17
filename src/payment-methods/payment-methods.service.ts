import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import {
  FilterDto,
  PaymentMethodConceptDto,
  PaymentMethodDto,
  SubconceptDto,
} from '../models';
import { PaymentMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ConceptsService } from '../concepts/concepts.service';

@Injectable()
export class PaymentMethodsService {
  constructor(
    private prismaService: PrismaService,
    private readonly conceptsService: ConceptsService,
  ) {}

  private async getPaymentMethodConceptsForCreate(
    subconcepts: PaymentMethodConceptDto[],
    parentId: string,
    createdBy: string,
  ) {
    const prismaSubconcepts: Prisma.PaymentMethodConceptCreateManyInput[] = [];
    if (subconcepts) {
      for (const subconcept of subconcepts) {
        const originConcept = await this.conceptsService.findOne({
          id: subconcept.concept.id,
        });
        prismaSubconcepts.push({
          paymentMethodId: parentId,
          amount: subconcept.amount,
          conceptId: originConcept.id,
        });
      }
    }
    return prismaSubconcepts;
  }

  async create(createPaymentMethodDto: PaymentMethodDto, createdBy: string) {
    try {
      const { paymentMethodConcepts, ...others } = createPaymentMethodDto;
      const data: Prisma.PaymentMethodCreateInput = others;
      return await this.prismaService.$transaction(async (prisma) => {
        console.log(data);
        const createdPaymentMethod = await prisma.paymentMethod.create({
          data,
        });

        const prismaPaymentMethodConcepts =
          await this.getPaymentMethodConceptsForCreate(
            paymentMethodConcepts,
            createdPaymentMethod.id,
            createdBy,
          );

        await prisma.paymentMethodConcept.createMany({
          data: prismaPaymentMethodConcepts,
        });

        return createdPaymentMethod;
      });
    } catch (error) {
      console.log('Create Payment Method transaction failed');
      console.log(error);

      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findAllNames(params?: FilterDto) {
    const { pageSize = 20, current = 1, name } = params;

    const options: {
      skip?: number;
      take?: number;
      cursor?: Prisma.PaymentMethodWhereUniqueInput;
      where?: Prisma.PaymentMethodWhereInput;
      orderBy?: Prisma.PaymentMethodOrderByWithRelationInput;
      select: Prisma.PaymentMethodSelect;
    } = {
      take: pageSize,
      skip: (current - 1) * pageSize,
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        paymentMethodConcepts: {
          select: {
            amount: true,
          },
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    };

    if (name) {
      options.where = {
        name: {
          contains: `${name}`,
        },
      };
    }

    const result = await this.prismaService.paymentMethod.findMany(options);

    return result.map((result) => {
      const { paymentMethodConcepts, ...rest } = result;
      return { ...rest, ...paymentMethodConcepts[0] };
    });
  }

  async findAll(params?: FilterDto) {
    const { pageSize = 20, current = 1, name, sort } = params;
    const sorter = sort ? JSON.parse(sort) : {};
    const options: {
      skip?: number;
      take?: number;
      cursor?: Prisma.PaymentMethodWhereUniqueInput;
      where?: Prisma.PaymentMethodWhereInput;
      orderBy?: Prisma.PaymentMethodOrderByWithRelationInput;
      select: Prisma.PaymentMethodSelect;
    } = {
      take: pageSize,
      skip: (current - 1) * pageSize,
      orderBy: {
        name: 'asc',
      },

      select: {
        id: true,
        name: true,
        paymentMethodConcepts: {
          select: {
            concept: {
              select: {
                id: true,
                name: true,
              },
            },
            amount: true,
          },
        },
      },
    };

    if (Object.keys(sorter).length > 0) {
    }

    if (name) {
      options.where = {
        name: {
          contains: `${name}`,
          mode: 'insensitive',
        },
      };
    }

    const paymentMethodCount = await this.prismaService.paymentMethod.count();

    const result: Partial<PaymentMethod>[] =
      await this.prismaService.paymentMethod.findMany(options);

    return {
      data: result,
      current,
      pageSize,
      success: true,
      total: paymentMethodCount,
    };
  }

  async findOne(where: Prisma.PaymentMethodWhereUniqueInput) {
    const paymentMethod = await this.prismaService.paymentMethod.findUnique({
      where,
      include: {
        payments: true,
        paymentMethodConcepts: true,
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment Method not found');
    }
    return paymentMethod;
  }

  async getCurrentFeeById(where: Prisma.PaymentMethodWhereUniqueInput) {
    const paymentMethod = await this.prismaService.paymentMethod.findUnique({
      where,
      select: {
        id: true,
        name: true,
        paymentMethodConcepts: {
          select: {
            amount: true,
          },
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException('PaymentMethod not found');
    }
    const { id, paymentMethodConcepts } = paymentMethod;

    return {
      id,
      amount: paymentMethodConcepts[0].amount,
    };
  }

  async update(
    params: {
      where: Prisma.PaymentMethodWhereUniqueInput;
      data: UpdatePaymentMethodDto;
    },
    updatedBy: string,
  ): Promise<PaymentMethod> {
    try {
      const { data, where } = params;
      const paymentMethod = await this.findOne(where);

      const { paymentMethodConcepts, ...newData } = data;

      return await this.prismaService.$transaction(async (prisma) => {
        for (const originSubconcept of paymentMethod.paymentMethodConcepts) {
          await prisma.paymentMethodConcept.delete({
            where: {
              paymentMethodId_conceptId: {
                conceptId: originSubconcept.conceptId,
                paymentMethodId: originSubconcept.paymentMethodId,
              },
            },
          });
        }

        const prismaPaymentMethodConcepts =
          await this.getPaymentMethodConceptsForCreate(
            paymentMethodConcepts,
            paymentMethod.id,
            updatedBy,
          );

        await prisma.paymentMethodConcept.createMany({
          data: prismaPaymentMethodConcepts,
        });
        return this.prismaService.paymentMethod.update({
          data: newData,
          where,
        });
      });
    } catch (err) {
      console.log('Update payment method transaction failed');
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  private async remove(
    where: Prisma.PaymentMethodWhereUniqueInput,
  ): Promise<PaymentMethod> {
    return this.prismaService.paymentMethod.delete({
      where,
    });
  }

  async batchRemove({ key }: { key: string[] }) {
    try {
      return await this.prismaService.$transaction(async () => {
        await key.reduce(async (antPromise, item) => {
          await antPromise;
          const paymentMethod = await this.findOne({ id: item });
          if (
            paymentMethod.payments.length > 0 ||
            paymentMethod.paymentMethodConcepts.length > 0
          ) {
            throw new PreconditionFailedException({
              error: `The payment method : ${paymentMethod.name}, has associated information and cannot be deleted.`,
            });
          }

          await this.remove({ id: item });
        }, Promise.resolve());
      });
    } catch (err) {
      console.log('Delete PaymentMethods transaction failed');
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}

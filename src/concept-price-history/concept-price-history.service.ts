import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UpdateConceptPriceHistoryDto } from './dto/update-concept-price-history.dto';
import { ConceptPriceHistoryDto } from '../models/dto/concept-price-history.dto';
import { PrismaService } from '../database/prisma.service';
import { ConceptPriceHistory, Prisma } from '@prisma/client';
import { FilterDto } from '../models';

@Injectable()
export class ConceptPriceHistoryService {
  constructor(private prismaService: PrismaService) {}

  private async validateReferences(
    data: ConceptPriceHistoryDto | UpdateConceptPriceHistoryDto,
    id: string,
  ) {
    /*if (data.effectiveDate) {
      const existUsername = await this.findDuplicateEmail({
        email: data.email,
        id,
      });
      if (existUsername) {
        throw new UnprocessableEntityException('User email alredy registered');
      }
    }*/
    return data;
  }
  async create(params: ConceptPriceHistoryDto, createdBy: string) {
    const { concept, ...others } = params;
    try {
      const data: Prisma.ConceptPriceHistoryCreateInput = {
        ...others,
        concept: { connect: concept },
        uinsert: {
          connect: {
            id: createdBy,
          },
        },
      };

      await this.validateReferences(params, '');
      return await this.prismaService.conceptPriceHistory.create({
        data,
      });
    } catch (error) {
      console.log('Create Concepts price transaction failed');
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(params?: FilterDto) {
    const { pageSize = 20, current = 1, name, sort } = params;
    const sorter = sort ? JSON.parse(sort) : {};
    const options: {
      skip?: number;
      take?: number;
      cursor?: Prisma.ConceptPriceHistoryWhereUniqueInput;
      where?: Prisma.ConceptPriceHistoryWhereInput;
      orderBy?: Prisma.ConceptPriceHistoryOrderByWithRelationInput;
      select: Prisma.ConceptPriceHistorySelect;
    } = {
      take: pageSize,
      skip: (current - 1) * pageSize,
      orderBy: {
        concept: { name: 'asc' },
      },

      select: {
        id: true,
        effectiveDate: true,
        price: true,
        concept: {
          select: {
            name: true,
          },
        },
      },
    };

    if (Object.keys(sorter).length > 0) {
      Object.keys(sorter).forEach((key) => {
        const direction = sorter[key] === 'descend' ? 'desc' : 'asc';
        switch (key) {
          case 'concept,name':
            options.orderBy = {
              concept: {
                name: direction,
              },
            };
            break;
          case 'price':
            options.orderBy = {
              price: direction,
            };
            break;
          case 'effectiveDate':
            options.orderBy = {
              effectiveDate: direction,
            };
            break;

          default:
            break;
        }
      });
    }

    if (name) {
      options.where = {
        OR: [
          {
            concept: {
              name: {
                contains: `${name}`,
                mode: 'insensitive',
              },
            },
          },
        ],
      };
    }

    const conceptCount = await this.prismaService.concept.count();

    const result: Partial<ConceptPriceHistoryDto>[] =
      await this.prismaService.conceptPriceHistory.findMany(options);

    return {
      data: result,
      current,
      pageSize,
      success: true,
      total: conceptCount,
    };
  }

  async findOne(where: Prisma.ConceptPriceHistoryWhereUniqueInput) {
    const conceptPrice =
      await this.prismaService.conceptPriceHistory.findUnique({
        where,
        include: {
          concept: true,
          invoiceDetails: true,
        },
      });

    if (!conceptPrice) {
      throw new NotFoundException('Concept price not found');
    }
    return conceptPrice;
  }

  private async remove(
    where: Prisma.ConceptPriceHistoryWhereUniqueInput,
  ): Promise<ConceptPriceHistory> {
    return this.prismaService.conceptPriceHistory.delete({
      where,
    });
  }

  async batchRemove({ key }: { key: string[] }) {
    try {
      return await this.prismaService.$transaction(async () => {
        await key.reduce(async (antPromise, item) => {
          await antPromise;
          const conceptPrice = await this.findOne({ id: item });
          if (conceptPrice.invoiceDetails.length > 0) {
            throw new PreconditionFailedException({
              error: `The concept price: ${conceptPrice.concept.name}, has associated information and cannot be deleted.`,
            });
          }

          await this.remove({ id: item });
        }, Promise.resolve());
      });
    } catch (err) {
      console.log('Delete Concepts transaction failed');
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}

import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FilterDto, ConceptDto, SubconceptDto } from '../models';
import { UpdateConceptDto } from './dto/update-concept.dto';
import { PrismaService } from '../database/prisma.service';
import { Concept, Prisma } from '@prisma/client';

@Injectable()
export class ConceptsService {
  constructor(private prismaService: PrismaService) {}

  private async validateReferences(
    data: ConceptDto | UpdateConceptDto,
    id: string,
  ) {
    if (data.name) {
      const existConceptName = await this.findDuplicateName({
        name: data.name,
        id,
      });
      if (existConceptName) {
        throw new UnprocessableEntityException('Concept alredy registered');
      }
    }
    return data;
  }

  private async findDuplicateName(
    conceptWhereUniqueInput: Prisma.ConceptWhereUniqueInput,
  ): Promise<Concept> {
    return await this.prismaService.concept.findFirst({
      where: {
        name: conceptWhereUniqueInput.name,
        NOT: {
          id: conceptWhereUniqueInput.id,
        },
      },
    });
  }

  private async getSubconceptsForCreate(
    subconcepts: SubconceptDto[],
    parentId: string,
    createdBy: string,
  ) {
    const prismaSubconcepts: Prisma.SubconceptCreateManyInput[] = [];
    if (subconcepts) {
      for (const subconcept of subconcepts) {
        const originConcept = await this.findOne({
          id: subconcept.concept.id,
        });
        prismaSubconcepts.push({
          parentId: parentId,
          amount: subconcept.amount,
          uinsertId: createdBy,
          childId: originConcept.id,
        });
      }
    }
    return prismaSubconcepts;
  }

  async create(params: ConceptDto, createdBy: string): Promise<Concept> {
    try {
      const { subconcepts, ...others } = params;
      const data: Prisma.ConceptCreateInput = others;
      return await this.prismaService.$transaction(async (prisma) => {
        const createdConcept = await prisma.concept.create({
          data,
        });
        const prismaSubconcepts = await this.getSubconceptsForCreate(
          subconcepts,
          createdConcept.id,
          createdBy,
        );

        await prisma.subconcept.createMany({
          data: prismaSubconcepts,
        });

        return createdConcept;
      });
    } catch (err) {
      console.log('Create Concepts transaction failed');
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async findParentsNames(params?: FilterDto) {
    const where: Prisma.ConceptWhereInput = {
      isChild: false,
    };
    return this.findAllNames(where, params);
  }

  async findChildsNames(params?: FilterDto) {
    const where: Prisma.ConceptWhereInput = {
      isChild: true,
    };
    return this.findAllNames(where, params);
  }

  private async findAllNames(
    where: Prisma.ConceptWhereInput,
    params?: FilterDto,
  ) {
    const { pageSize = 20, current = 1, name } = params;

    const whereInput: Prisma.ConceptWhereInput = {
      ...where,
      ...(name
        ? {
            AND: [
              {
                name: {
                  contains: `${name}`,
                },
              },
            ],
          }
        : {}),
    };

    const today = new Date();

    const options: {
      skip?: number;
      take?: number;
      cursor?: Prisma.ConceptWhereUniqueInput;
      where?: Prisma.ConceptWhereInput;
      orderBy?: Prisma.ConceptOrderByWithRelationInput;
      select: Prisma.ConceptSelect;
    } = {
      take: pageSize,
      skip: (current - 1) * pageSize,
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        conceptType: true,
        conceptPriceHistory: {
          select: {
            price: true,
          },
          take: 1,
          orderBy: {
            effectiveDate: 'desc',
          },
          where: {
            effectiveDate: {
              lte: today,
            },
          },
        },
      },
      where: whereInput,
    };

    const result = await this.prismaService.concept.findMany(options);

    return result.map((result) => {
      const { conceptPriceHistory, ...rest } = result;
      return { ...rest, ...conceptPriceHistory[0] };
    });
  }

  async findAll(params?: FilterDto) {
    const { pageSize = 20, current = 1, name } = params;

    const options: {
      skip?: number;
      take?: number;
      cursor?: Prisma.ConceptWhereUniqueInput;
      where?: Prisma.ConceptWhereInput;
      orderBy?: Prisma.ConceptOrderByWithRelationInput;
      select: Prisma.ConceptSelect;
    } = {
      take: pageSize,
      skip: (current - 1) * pageSize,
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        conceptType: true,
        isToThirdParty: true,
        isPercentage: true,
        isChild: true,
        subconcepts: {
          select: {
            concept: {
              select: {
                id: true,
              },
            },
            amount: true,
          },
        },
        parentConcepts: {
          select: {
            concept: true,
          },
        },
      },
    };

    if (name) {
      options.where = {
        OR: [
          {
            name: {
              contains: `${name}`,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    const conceptCount = await this.prismaService.concept.count();

    const result: Partial<Concept>[] =
      await this.prismaService.concept.findMany(options);

    return {
      data: result,
      current,
      pageSize,
      success: true,
      total: conceptCount,
    };
  }

  async findOne(where: Prisma.ConceptWhereUniqueInput) {
    const concept = await this.prismaService.concept.findUnique({
      where,
      include: {
        subconcepts: true,
        parentConcepts: true,
        conceptPriceHistory: {
          include: {
            invoiceDetails: true,
          },
        },
      },
    });

    if (!concept) {
      throw new NotFoundException('Concept not found');
    }

    return concept;
  }

  async getCurrentPriceById(where: Prisma.ConceptWhereUniqueInput) {
    const today = new Date();
    const concept = await this.prismaService.concept.findUnique({
      where,
      select: {
        id: true,
        name: true,
        conceptType: true,
        conceptPriceHistory: {
          select: {
            price: true,
            id: true,
          },
          take: 1,
          orderBy: {
            effectiveDate: 'desc',
          },
          where: {
            effectiveDate: {
              lte: today,
            },
          },
        },
      },
    });

    if (!concept) {
      throw new NotFoundException('Concept not found');
    }
    const { id, conceptPriceHistory } = concept;

    return {
      id,
      conceptPriceId: conceptPriceHistory[0].id,
      price: conceptPriceHistory[0].price,
    };
  }

  async update(
    params: {
      where: Prisma.ConceptWhereUniqueInput;
      data: UpdateConceptDto;
    },
    updatedBy: string,
  ): Promise<Concept> {
    try {
      const { data, where } = params;
      const concept = await this.findOne(where);

      /*if (concept.conceptPriceHistory.) {
        throw new UnprocessableEntityException(
          `The concept : ${concept.name}, has associated information and cannot be updated.`,
        );
      }*/

      const { subconcepts, ...newData } = data;
      return await this.prismaService.$transaction(async (prisma) => {
        await this.validateReferences(newData, where.id);

        for (const originSubconcept of concept.subconcepts) {
          await prisma.subconcept.delete({
            where: {
              id: originSubconcept.id,
            },
          });
        }

        const prismaSubconcepts = await this.getSubconceptsForCreate(
          subconcepts,
          concept.id,
          updatedBy,
        );

        await prisma.subconcept.createMany({
          data: prismaSubconcepts,
        });

        return this.prismaService.concept.update({
          data: newData,
          where,
        });
      });
    } catch (err) {
      console.log('Update Concepts transaction failed');
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  private async remove(
    where: Prisma.ConceptWhereUniqueInput,
  ): Promise<Concept> {
    return this.prismaService.concept.delete({
      where,
    });
  }

  async batchRemove({ key }: { key: string[] }) {
    try {
      return await this.prismaService.$transaction(async () => {
        await key.reduce(async (antPromise, item) => {
          await antPromise;
          const concept = await this.findOne({ id: item });
          if (
            concept.conceptPriceHistory.length > 0 ||
            concept.subconcepts.length > 0 ||
            concept.parentConcepts.length > 0
          ) {
            throw new PreconditionFailedException({
              error: `The concept : ${concept.name}, has associated information and cannot be deleted.`,
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

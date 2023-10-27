import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Invoice,
  InvoiceStatusEnum,
  Prisma,
  ConceptTypeEnum,
  InvoiceDetail,
} from '@prisma/client';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceDto, PaginationArgs, ResponseDto } from '../models';
import { PrismaService } from '../database/prisma.service';
import { ApplicantsService } from '../applicants/applicants.service';
import {
  InvoiceDetailDto,
  InvoiceDetailGetPayload,
} from '../models/dto/invoice-detail.dto';
import { ConceptsService } from '../concepts/concepts.service';
import { FilterInvoicesDto } from './dto/filter-invoices-dto';
import { InvoiceWithDetails } from '../models/dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private prismaService: PrismaService,
    private readonly applicantService: ApplicantsService,
    private readonly conceptsService: ConceptsService,
  ) {}

  private async getInvoiceDetailsForCreate(
    invoiceDetails: InvoiceDetailDto[],
    parentId: string,
  ) {
    const prismaInvoiceDetails: Prisma.InvoiceDetailCreateManyInput[] = [];
    if (invoiceDetails) {
      for (const invoiceDetail of invoiceDetails) {
        const originConcept = await this.conceptsService.getCurrentPriceById({
          id: invoiceDetail.conceptId,
        });
        prismaInvoiceDetails.push({
          invoiceId: parentId,
          amount: originConcept.price,
          conceptPriceId: originConcept.conceptPriceId,
          qty: invoiceDetail.qty,
        });
      }
    }
    return prismaInvoiceDetails;
  }

  async create(
    createInvoiceDto: InvoiceDto,
    createdBy: string,
  ): Promise<Partial<Invoice>> {
    try {
      const { applicant, status, invoiceDetail, ...rest } = createInvoiceDto;
      const defaultStatus = status || InvoiceStatusEnum.DRAFT;
      await this.applicantService.findOne({
        id: applicant.id,
      });

      const data: Prisma.InvoiceCreateInput = {
        ...rest,
        invoiceNumber: '',
        status: defaultStatus,
        applicant: { connect: { id: applicant.id } },
        uinsert: { connect: { id: createdBy } },
      };
      return await this.prismaService.$transaction(async (prisma) => {
        const createdInvoice = await this.prismaService.invoice.create({
          data,
        });

        const prismaInvoiceDetails = await this.getInvoiceDetailsForCreate(
          invoiceDetail,
          createdInvoice.id,
        );

        await prisma.invoiceDetail.createMany({
          data: prismaInvoiceDetails,
        });

        return createdInvoice;
      });
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(
        `Failed to create invoice. Details: ${error.message}`,
      );
    }
  }

  async findAll(
    params?: FilterInvoicesDto,
  ): Promise<ResponseDto<Partial<Invoice>>> {
    const {
      pageSize = 20,
      current = 1,
      name,
      sort,
      finalDate,
      initialDate,
      status,
    } = params;

    const whereInput: Prisma.InvoiceWhereInput = {
      ...(name
        ? {
            AND: [
              {
                applicant: {
                  user: {
                    OR: [
                      {
                        name: {
                          contains: `${name}`,
                          mode: 'insensitive',
                        },
                      },
                      {
                        email: {
                          contains: `${name}`,
                          mode: 'insensitive',
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
      ...(initialDate && finalDate
        ? {
            invoiceDate: {
              gte: new Date(initialDate),
              lte: new Date(finalDate),
            },
          }
        : {}),
      ...(status
        ? {
            status,
          }
        : {}),
    };

    const sorter = sort ? JSON.parse(sort) : {};
    const paginationArgs: PaginationArgs<
      Prisma.InvoiceWhereUniqueInput,
      Prisma.InvoiceWhereInput,
      Prisma.InvoiceOrderByWithRelationInput,
      Prisma.InvoiceSelect
    > = {
      take: pageSize,
      skip: (current - 1) * pageSize,
      select: {
        id: true,
        invoiceDate: true,
        invoiceNumber: true,
        invoiceDetail: {
          select: {
            amount: true,
            qty: true,
            conceptPrice: {
              select: {
                concept: {
                  select: {
                    conceptType: true,
                  },
                },
              },
            },
          },
        },
        status: true,
        applicant: {
          select: {
            id: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      where: whereInput,
    };

    const count = await this.prismaService.invoice.count({ where: whereInput });

    const result: Partial<InvoiceWithDetails>[] =
      await this.prismaService.invoice.findMany(paginationArgs);

    result.forEach((invoice) => {
      let totalAmount = 0;
      if (invoice.invoiceDetail && Array.isArray(invoice.invoiceDetail)) {
        totalAmount = invoice.invoiceDetail.reduce((sum, detail) => {
          const subtotal = this.getItemSubtotal(detail);
          return sum + (subtotal || 0);
        }, 0);
      }
      invoice.totalAmount = totalAmount;
    });

    return {
      data: result,
      current,
      pageSize,
      success: true,
      total: count,
    };
  }

  private getItemSubtotal(invoiceDetail: InvoiceDetailGetPayload) {
    const amount =
      invoiceDetail?.conceptPrice.concept.conceptType === ConceptTypeEnum.DEBIT
        ? invoiceDetail.amount * -1
        : invoiceDetail.amount;
    const qty = invoiceDetail?.qty ? invoiceDetail.qty : 1;
    return amount * qty;
  }

  async findOne(where: Prisma.InvoiceWhereUniqueInput) {
    const invoice = await this.prismaService.invoice.findUnique({
      where,
      select: {
        id: true,
        invoiceDate: true,
        invoiceNumber: true,
        invoiceDetail: {
          select: {
            id: true,
            amount: true,
            qty: true,
            description: true,
            conceptPrice: {
              select: {
                concept: {
                  select: {
                    id: true,
                    name: true,
                    conceptType: true,
                  },
                },
              },
            },
          },
        },
        status: true,
        applicant: {
          select: {
            id: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
        payments: true,
      },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${where.id} not found`);
    }
    const { invoiceDetail, ...rest } = invoice;
    return {
      ...rest,
      invoiceDetail: invoiceDetail.map((detail) => {
        const { conceptPrice, ...others } = detail;
        const subtotal = this.getItemSubtotal(detail);
        return {
          conceptId: conceptPrice.concept.id,
          subtotal,
          ...others,
        };
      }),
    };
  }

  async update(params: {
    where: Prisma.InvoiceWhereUniqueInput;
    data: UpdateInvoiceDto;
  }): Promise<Invoice> {
    const { data, where } = params;
    const { id, applicant, invoiceDetail, ...rest } = data;

    try {
      await this.findOne(where);
      const updateData: Prisma.InvoiceUpdateInput = {
        ...rest,
      };
      if (applicant) {
        await this.applicantService.findOne({
          id: applicant.id,
        });
      }
      updateData.applicant = { connect: { id: applicant.id } };
      return await this.prismaService.invoice.update({
        where,
        data: updateData,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating invoice (${id}): ${error.message}`,
      );
    }
  }

  async remove(where: Prisma.InvoiceWhereUniqueInput) {
    try {
      const invoice = await this.findOne(where);

      const { id, payments, status } = invoice;
      if (payments.length > 0) {
        throw new HttpException(
          `The Invoice with id ${id}, has associated information and cannot be deleted.`,
          HttpStatus.PRECONDITION_FAILED,
        );
      }

      const validStatuses: InvoiceStatusEnum[] = [
        InvoiceStatusEnum.DRAFT,
        InvoiceStatusEnum.PENDING,
      ];

      if (!validStatuses.includes(status as InvoiceStatusEnum)) {
        throw new HttpException(
          `Cannot delete invoice with id ${id}. The invoice status (${status}) is not valid for deletion.`,
          HttpStatus.PRECONDITION_FAILED,
        );
      }
      const invoiceType = await this.prismaService.invoice.delete({ where });
      return invoiceType;
    } catch (error) {
      throw new NotFoundException(`Invoice with id ${where.id} not found`);
    }
  }

  async batchRemove({ key }: { key: string[] }) {
    try {
      return await this.prismaService.$transaction(async (prisma) => {
        await key.reduce(async (antPromise, item) => {
          await antPromise;

          await this.remove({ id: item });
        }, Promise.resolve());
      });
    } catch (err) {
      console.log('Delete Invoices transaction failed');
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}

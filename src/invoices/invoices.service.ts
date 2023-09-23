import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Invoice, InvoiceStatusEnum, Prisma } from '@prisma/client';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { FilterDto, InvoiceDto, PaginationArgs, ResponseDto } from '../models';
import { PrismaService } from '../database/prisma.service';
import { ApplicantsService } from '../applicants/applicants.service';

@Injectable()
export class InvoicesService {
  constructor(
    private prismaService: PrismaService,
    private readonly applicantService: ApplicantsService,
  ) {}

  async create(
    createInvoiceDto: InvoiceDto,
    createdBy: string,
  ): Promise<Partial<Invoice>> {
    try {
      const { applicantId, status, ...rest } = createInvoiceDto;
      await this.applicantService.findOne({
        id: applicantId,
      });

      const defaultStatus = status || InvoiceStatusEnum.DRAFT;

      const data: Prisma.InvoiceCreateInput = {
        ...rest,
        status: defaultStatus,
        applicant: { connect: { id: applicantId } },
        uinsert: { connect: { id: createdBy } },
      };
      return this.prismaService.invoice.create({ data });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create invoice. Details: ${error.message}`,
      );
    }
  }

  async findAll(params?: FilterDto): Promise<ResponseDto<Partial<Invoice>>> {
    const { pageSize = 20, current = 1, name, sort } = params;

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
        invoiceDetail: true,
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
    };

    const count = await this.prismaService.invoice.count();

    const result: Partial<InvoiceDto>[] =
      await this.prismaService.invoice.findMany(paginationArgs);

    return {
      data: result,
      current,
      pageSize,
      success: true,
      total: count,
    };
  }

  async findOne(where: Prisma.InvoiceWhereUniqueInput) {
    const invoice = await this.prismaService.invoice.findUnique({
      where,
      include: {
        applicant: true,
        payments: true,
      },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${where.id} not found`);
    }
    return invoice;
  }

  async update(params: {
    where: Prisma.InvoiceWhereUniqueInput;
    data: UpdateInvoiceDto;
  }): Promise<Invoice> {
    const { data, where } = params;
    const { id, applicantId, ...rest } = data;

    try {
      await this.findOne(where);
      const updateData: Prisma.InvoiceUpdateInput = {
        ...rest,
      };
      if (applicantId) {
        await this.applicantService.findOne({
          id: applicantId,
        });
      }
      updateData.applicant = { connect: { id: applicantId } };
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
      console.log('Delete Borrowers transaction failed');
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}

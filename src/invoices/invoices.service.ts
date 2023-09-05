import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Invoice, InvoiceStatusEnum, Prisma } from '@prisma/client';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { FilterDto, InvoiceDto, PaginationArgs, ResponseDto } from '../models';
import { PrismaService } from '../database/prisma.service';
import { StudentsService } from '../students/students.service';

@Injectable()
export class InvoicesService {
  constructor(
    private prismaService: PrismaService,
    private readonly studentService: StudentsService,
  ) {}

  async create(
    createInvoiceDto: InvoiceDto,
    createdBy: string,
  ): Promise<Partial<Invoice>> {
    try {
      const { studentId, status, ...rest } = createInvoiceDto;
      await this.studentService.findOne({
        id: studentId,
      });

      const defaultStatus = status || InvoiceStatusEnum.DRAFT;

      const data: Prisma.InvoiceCreateInput = {
        ...rest,
        status: defaultStatus,
        student: { connect: { id: studentId } },
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
        student: {
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

  async findOne(
    where: Prisma.InvoiceWhereUniqueInput,
  ): Promise<Partial<InvoiceDto> | null> {
    const invoice = await this.prismaService.invoice.findUnique({
      where,
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
    const { id, studentId, ...rest } = data;

    try {
      await this.findOne(where);
      const updateData: Prisma.InvoiceUpdateInput = {
        ...rest,
      };
      if (studentId) {
        await this.studentService.findOne({
          id: studentId,
        });
      }
      updateData.student = { connect: { id: studentId } };
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
      const invoiceType = await this.prismaService.invoice.delete({ where });
      return invoiceType;
    } catch (error) {
      throw new NotFoundException(`Device with id ${where.id} not found`);
    }
  }
}

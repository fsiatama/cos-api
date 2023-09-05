import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Invoice, InvoiceStatusEnum, Prisma } from '@prisma/client';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceDto } from '../models';
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

  findAll() {
    return `This action returns all invoices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invoice`;
  }

  update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    return `This action updates a #${id} invoice`;
  }

  remove(id: number) {
    return `This action removes a #${id} invoice`;
  }
}

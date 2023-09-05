import { Injectable } from '@nestjs/common';
import { UpdateInvoiceDetailDto } from './dto/update-invoice-detail.dto';
import { InvoiceDetailDto } from '../models/dto/invoice-detail.dto';

@Injectable()
export class InvoiceDetailsService {
  create(createInvoiceDetailDto: InvoiceDetailDto) {
    return 'This action adds a new invoiceDetail';
  }

  findAll() {
    return `This action returns all invoiceDetails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invoiceDetail`;
  }

  update(id: number, updateInvoiceDetailDto: UpdateInvoiceDetailDto) {
    return `This action updates a #${id} invoiceDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} invoiceDetail`;
  }
}

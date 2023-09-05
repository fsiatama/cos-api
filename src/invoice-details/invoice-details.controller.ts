import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InvoiceDetailsService } from './invoice-details.service';
import { UpdateInvoiceDetailDto } from './dto/update-invoice-detail.dto';
import { InvoiceDetailDto } from '../models/dto/invoice-detail.dto';

@Controller('invoice-details')
export class InvoiceDetailsController {
  constructor(private readonly invoiceDetailsService: InvoiceDetailsService) {}

  @Post()
  create(@Body() createInvoiceDetailDto: InvoiceDetailDto) {
    return this.invoiceDetailsService.create(createInvoiceDetailDto);
  }

  @Get()
  findAll() {
    return this.invoiceDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceDetailsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDetailDto: UpdateInvoiceDetailDto,
  ) {
    return this.invoiceDetailsService.update(+id, updateInvoiceDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceDetailsService.remove(+id);
  }
}

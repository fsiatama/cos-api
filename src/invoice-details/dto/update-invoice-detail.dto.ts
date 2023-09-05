import { PartialType } from '@nestjs/swagger';
import { CreateInvoiceDetailDto } from './create-invoice-detail.dto';

export class UpdateInvoiceDetailDto extends PartialType(CreateInvoiceDetailDto) {}

import { PartialType } from '@nestjs/swagger';
import { InvoiceDto } from '../../models';

export class UpdateInvoiceDto extends PartialType(InvoiceDto) {}

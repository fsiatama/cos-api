import { PartialType } from '@nestjs/swagger';
import { InvoiceDetailDto } from '../../models/dto/invoice-detail.dto';

export class UpdateInvoiceDetailDto extends PartialType(InvoiceDetailDto) {}

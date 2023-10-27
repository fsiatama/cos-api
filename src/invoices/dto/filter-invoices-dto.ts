import { InvoiceStatusEnum } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FilterDto } from 'src/models';

export class FilterInvoicesDto extends FilterDto {
  @IsOptional()
  @IsString()
  initialDate?: string;

  @IsOptional()
  @IsString()
  finalDate?: string;

  @IsOptional()
  @IsEnum(InvoiceStatusEnum)
  readonly status?: InvoiceStatusEnum;
}

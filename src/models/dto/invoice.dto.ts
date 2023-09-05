import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatusEnum } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDate,
  IsEnum,
} from 'class-validator';

export class InvoiceDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Invoice number' })
  readonly invoiceNumber: string;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({ description: 'Date of the invoice' })
  readonly invoiceDate: Date;

  @IsOptional()
  @IsEnum(InvoiceStatusEnum)
  @ApiProperty({
    description: 'Status of the invoice',
    enum: InvoiceStatusEnum,
  })
  readonly status?: InvoiceStatusEnum;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'ID of the student or applicant' })
  readonly studentId: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ description: 'ID of the contract', nullable: true })
  readonly contractId?: string;
}

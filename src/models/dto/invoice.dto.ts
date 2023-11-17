import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatusEnum, Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDate,
  IsEnum,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
  IsArray,
  IsCurrency,
  IsNumber,
} from 'class-validator';
import { UUIDDto } from './filter.dto';
import { InvoiceDetailDto } from './invoice-detail.dto';
import { PaymentDto } from './payment.dto';

export class InvoiceDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Invoice number' })
  readonly invoiceNumber?: string;

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

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => UUIDDto)
  @ApiProperty({ type: () => UUIDDto })
  readonly applicant: UUIDDto;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ description: 'ID of the contract', nullable: true })
  readonly contractId?: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InvoiceDetailDto)
  @ApiProperty({ type: () => InvoiceDetailDto })
  readonly invoiceDetail: InvoiceDetailDto[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  @ApiProperty({ type: () => PaymentDto })
  readonly payments: PaymentDto[];
}

const invoiceWithDetails = Prisma.validator<Prisma.InvoiceDefaultArgs>()({
  select: {
    id: true,
    invoiceDate: true,
    invoiceNumber: true,
    invoiceDetail: {
      select: {
        amount: true,
        qty: true,
        conceptPrice: {
          select: {
            concept: {
              select: {
                conceptType: true,
              },
            },
          },
        },
      },
    },
    status: true,
    applicant: {
      select: {
        id: true,
        user: {
          select: { name: true, email: true },
        },
      },
    },
    payments: {
      select: {
        amount: true,
        id: true,
        description: true,
        paymentMethod: {
          select: {
            id: true,
            paymentMethodConcepts: {
              select: {
                amount: true,
              },
            },
          },
        },
      },
    },
  },
});

type InvoiceGetPayload = Prisma.InvoiceGetPayload<typeof invoiceWithDetails>;

export interface InvoiceWithDetails extends InvoiceGetPayload {
  totalAmount: number;
  totalPayments?: number;
}

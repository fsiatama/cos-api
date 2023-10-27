import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class InvoiceDetailDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Unique UUID for the invoice detail' })
  id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Description of the invoice detail' })
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Quantity of the invoice detail' })
  readonly qty: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'price of the concept' })
  readonly amount?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'qty * amount' })
  readonly subtotal?: number;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID of the concept associated with the invoice',
  })
  readonly conceptId: string;
}

const invoiceDetailWithConceptPrice =
  Prisma.validator<Prisma.InvoiceDetailDefaultArgs>()({
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
  });

export type InvoiceDetailGetPayload = Prisma.InvoiceDetailGetPayload<
  typeof invoiceDetailWithConceptPrice
>;

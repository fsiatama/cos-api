import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  IsDefined,
  Min,
} from 'class-validator';

export class PaymentDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Unique UUID for the payment' })
  id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Description of the invoice payment' })
  readonly description?: string;

  @IsDefined()
  @IsNotEmpty()
  @Min(0.1)
  @IsNumber()
  @ApiProperty({ description: 'price of the payment' })
  readonly amount?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Fee of the payment' })
  readonly fee?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Fee rate of the payment' })
  readonly feeRate: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'amount + fee' })
  readonly subtotal?: number;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID of the concept associated with the invoice',
  })
  readonly paymentMethodId: string;
}

const invoicePaymentWithConceps = Prisma.validator<Prisma.PaymentDefaultArgs>()(
  {
    select: {
      amount: true,
      id: true,
      description: true,
      fee: true,
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
);

export type InvoicePaymentGetPayload = Prisma.PaymentGetPayload<
  typeof invoicePaymentWithConceps
>;

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class InvoiceDetailDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({ description: 'Unique UUID for the invoice detail' })
  id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Description of the invoice detail' })
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Amount of the invoice detail' })
  readonly amount: number;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'ID of the associated invoice' })
  readonly invoiceId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID of the concept associated with the invoice',
  })
  readonly conceptId: string;
}

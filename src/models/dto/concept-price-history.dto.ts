import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class ConceptPriceHistoryDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'Unique UUID for the concept price history record',
  })
  id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Description of the concept price history record',
  })
  readonly effectiveDate: Date;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Amount of the concept price history record' })
  readonly amount: number;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID of the concept associated with the invoice',
  })
  readonly conceptId: string;
}

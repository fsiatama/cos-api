import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
  IsDefined,
  IsDate,
  IsPositive,
} from 'class-validator';
import { UUIDDto } from './filter.dto';

export class ConceptPriceHistoryDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'Unique UUID for the concept price history record',
  })
  id?: string;

  @IsDefined()
  @IsDate()
  @ApiProperty({
    description: 'Description of the concept price history record',
  })
  readonly effectiveDate: Date;

  @IsDefined()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: 'Amount of the concept price history record' })
  readonly price: number;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => UUIDDto)
  @ApiProperty({ type: () => UUIDDto })
  readonly concept!: UUIDDto;
}

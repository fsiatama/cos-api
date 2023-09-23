import {
  IsDefined,
  ValidateNested,
  IsObject,
  IsNotEmptyObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDDto } from './filter.dto';

export class SubconceptDto {
  @IsDefined()
  @ApiProperty()
  readonly amount!: number;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => UUIDDto)
  @ApiProperty({ type: () => UUIDDto })
  readonly concept!: UUIDDto;
}

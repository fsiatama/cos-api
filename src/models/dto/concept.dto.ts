import {
  IsString,
  IsDefined,
  IsIn,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ConceptTypeEnum } from '@prisma/client';
import { getEnumValues } from '../helpers';
import { SubconceptDto } from './subconcept.dto';

export class ConceptDto {
  @IsDefined()
  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty()
  readonly name!: string;

  @IsDefined()
  @IsIn(getEnumValues(ConceptTypeEnum))
  @ApiProperty()
  readonly conceptType!: ConceptTypeEnum;

  @IsDefined()
  @IsBoolean()
  @ApiProperty()
  readonly isToThirdParty!: boolean;

  @IsDefined()
  @IsBoolean()
  @ApiProperty()
  readonly isPercentage!: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubconceptDto)
  @ApiProperty({ type: () => SubconceptDto })
  readonly subconcepts?: Partial<SubconceptDto[]>;
}

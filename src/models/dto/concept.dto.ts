import { IsString, IsDefined, IsIn, IsBoolean } from 'class-validator';
import { getEnumValues } from '../helpers';
import { ApiProperty } from '@nestjs/swagger';
import { ConceptTypeEnum } from '@prisma/client';

export class ConceptDto {
  @IsDefined()
  @IsString()
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
}

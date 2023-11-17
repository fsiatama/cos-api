import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { PaymentMethodConceptDto } from './payment-method-concept.dto';

export class PaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase())
  @ApiProperty({ description: `Payment Method name` })
  readonly name: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PaymentMethodConceptDto)
  @ApiProperty({ type: () => PaymentMethodConceptDto })
  readonly paymentMethodConcepts?: Partial<PaymentMethodConceptDto[]>;
}

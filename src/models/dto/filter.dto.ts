import { Transform } from 'class-transformer';
import { IsOptional, IsPositive, IsString, IsUUID, Min } from 'class-validator';

export class FilterDto {
  @IsOptional()
  @IsPositive()
  readonly pageSize: number;

  @IsOptional()
  @Min(0)
  readonly current: number;

  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  @IsString()
  readonly name: string;

  @IsOptional()
  sort: string;
}

export class UUIDDto {
  @IsUUID()
  readonly id: string;
}

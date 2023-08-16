import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsString,
  } from 'class-validator';
  
  export class PayloadTokenDto {
    @IsString()
    @IsNotEmpty()
    username: string;
  
    @IsString()
    @IsNotEmpty()
    sub: number;
  }
  
  export class SuccessResponseDto {
    @IsBoolean()
    success: boolean;
  }
  
  export class ResponseDto<Entity> {
    @IsArray()
    @IsNotEmpty()
    data: Entity[];
  
    @IsNumber()
    current: number;
  
    @IsNumber()
    pageSize: number;
  
    @IsBoolean()
    success: boolean;
  
    @IsNumber()
    total: number;
  }
  
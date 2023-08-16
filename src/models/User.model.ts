import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class User {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'the email of user' })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase())
  @ApiProperty({ description: `User name` })
  readonly name: string;
}

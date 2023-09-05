import { PartialType } from '@nestjs/swagger';
import { UserDto } from '../../models';

export class UpdateUserDto extends PartialType(UserDto) {}

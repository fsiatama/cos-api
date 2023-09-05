import { PartialType } from '@nestjs/swagger';
import { StudentDto } from '../../models';

export class UpdateStudentDto extends PartialType(StudentDto) {}

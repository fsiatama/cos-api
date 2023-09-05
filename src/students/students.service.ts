import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Student } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentDto } from '../models';
import { exclude } from '../models/helpers';

@Injectable()
export class StudentsService {
  constructor(private prismaService: PrismaService) {}
  create(createStudentDto: StudentDto) {
    return 'This action adds a new student';
  }

  findAll() {
    return `This action returns all students`;
  }

  async findOne(
    where: Prisma.StudentWhereUniqueInput,
  ): Promise<Partial<Student> | null> {
    const student = await this.prismaService.student.findUnique({ where });

    if (!student) {
      throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
    }
    return exclude(student, []);
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }
}

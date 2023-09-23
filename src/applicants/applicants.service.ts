import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Applicant } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ApplicantDto } from '../models';
import { exclude } from '../models/helpers';

@Injectable()
export class ApplicantsService {
  constructor(private prismaService: PrismaService) {}
  create(createApplicantDto: ApplicantDto) {
    return 'This action adds a new applicant';
  }

  findAll() {
    return `This action returns all applicants`;
  }

  async findOne(
    where: Prisma.ApplicantWhereUniqueInput,
  ): Promise<Partial<Applicant> | null> {
    const applicant = await this.prismaService.applicant.findUnique({ where });

    if (!applicant) {
      throw new HttpException('Applicant not found', HttpStatus.NOT_FOUND);
    }
    return exclude(applicant, []);
  }

  update(id: number, updateApplicantDto: UpdateApplicantDto) {
    return `This action updates a #${id} applicant`;
  }

  remove(id: number) {
    return `This action removes a #${id} applicant`;
  }
}

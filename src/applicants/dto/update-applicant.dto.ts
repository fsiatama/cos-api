import { PartialType } from '@nestjs/swagger';
import { ApplicantDto } from '../../models';

export class UpdateApplicantDto extends PartialType(ApplicantDto) {}

import { PartialType } from '@nestjs/swagger';
import { ConceptDto } from '../../models';

export class UpdateConceptDto extends PartialType(ConceptDto) {}

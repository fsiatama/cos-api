import { PartialType } from '@nestjs/swagger';
import { ConceptPriceHistoryDto } from '../../models/dto/concept-price-history.dto';

export class UpdateConceptPriceHistoryDto extends PartialType(
  ConceptPriceHistoryDto,
) {}

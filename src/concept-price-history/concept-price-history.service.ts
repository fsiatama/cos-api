import { Injectable } from '@nestjs/common';
import { UpdateConceptPriceHistoryDto } from './dto/update-concept-price-history.dto';
import { ConceptPriceHistoryDto } from '../models/dto/concept-price-history.dto';

@Injectable()
export class ConceptPriceHistoryService {
  create(createConceptPriceHistoryDto: ConceptPriceHistoryDto) {
    return 'This action adds a new conceptPriceHistory';
  }

  findAll() {
    return `This action returns all conceptPriceHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} conceptPriceHistory`;
  }

  update(
    id: number,
    updateConceptPriceHistoryDto: UpdateConceptPriceHistoryDto,
  ) {
    return `This action updates a #${id} conceptPriceHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} conceptPriceHistory`;
  }
}

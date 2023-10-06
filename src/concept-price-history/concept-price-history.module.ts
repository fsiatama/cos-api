import { Module } from '@nestjs/common';
import { ConceptPriceHistoryService } from './concept-price-history.service';
import { ConceptPriceHistoryController } from './concept-price-history.controller';

@Module({
  controllers: [ConceptPriceHistoryController],
  providers: [ConceptPriceHistoryService],
})
export class ConceptPriceHistoryModule {}

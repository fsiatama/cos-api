import { Module } from '@nestjs/common';
import { ConceptPriceHistoryService } from './concept-price-history.service';
import { ConceptPriceHistoryController } from './concept-price-history.controller';
import { PrismaModule } from '../database/prisma.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [PrismaModule, CaslModule],
  controllers: [ConceptPriceHistoryController],
  providers: [ConceptPriceHistoryService],
})
export class ConceptPriceHistoryModule {}

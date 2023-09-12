import { Module } from '@nestjs/common';
import { ConceptsService } from './concepts.service';
import { ConceptsController } from './concepts.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConceptsController],
  providers: [ConceptsService],
})
export class ConceptsModule {}

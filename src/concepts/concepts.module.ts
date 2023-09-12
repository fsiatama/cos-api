import { Module } from '@nestjs/common';
import { ConceptsService } from './concepts.service';
import { ConceptsController } from './concepts.controller';
import { PrismaModule } from '../database/prisma.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [PrismaModule, CaslModule],
  controllers: [ConceptsController],
  providers: [ConceptsService],
})
export class ConceptsModule {}

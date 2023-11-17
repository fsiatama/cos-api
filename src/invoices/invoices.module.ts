import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaModule } from '../database/prisma.module';
import { CaslModule } from '../casl/casl.module';
import { ApplicantsModule } from '../applicants/applicants.module';
import { ConceptsModule } from '../concepts/concepts.module';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';

@Module({
  imports: [
    PrismaModule,
    CaslModule,
    ApplicantsModule,
    ConceptsModule,
    PaymentMethodsModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}

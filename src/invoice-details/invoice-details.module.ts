import { Module } from '@nestjs/common';
import { InvoiceDetailsService } from './invoice-details.service';
import { InvoiceDetailsController } from './invoice-details.controller';

@Module({
  controllers: [InvoiceDetailsController],
  providers: [InvoiceDetailsService],
})
export class InvoiceDetailsModule {}

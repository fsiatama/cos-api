import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CaslModule } from './casl/casl.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ApplicantsModule } from './applicants/applicants.module';
import { InvoiceDetailsModule } from './invoice-details/invoice-details.module';
import { ConceptsModule } from './concepts/concepts.module';
import { ConceptPriceHistoryModule } from './concept-price-history/concept-price-history.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    UsersModule,
    PermissionsModule,
    CaslModule,
    InvoicesModule,
    ApplicantsModule,
    ConceptsModule,
    InvoiceDetailsModule,
    ConceptPriceHistoryModule,
    PaymentMethodsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

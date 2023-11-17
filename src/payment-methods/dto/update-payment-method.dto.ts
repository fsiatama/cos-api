import { PartialType } from '@nestjs/swagger';
import { PaymentMethodDto } from '../../models';

export class UpdatePaymentMethodDto extends PartialType(PaymentMethodDto) {}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { PaymentMethodsService } from './payment-methods.service';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { FilterDto, PaymentMethodDto, UUIDDto } from '../models';
import { CheckPolicies, PoliciesGuard } from '../auth/guards/policies.guard';
import { Action, AppAbility, Subject } from '../casl/casl-ability.factory';

@UseGuards(AuthGuard('jwt'))
@ApiTags('payment-methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  create(@Body() createPaymentMethodDto: PaymentMethodDto, @Request() req) {
    const { sub } = req.user;
    return this.paymentMethodsService.create(createPaymentMethodDto, sub);
  }

  @Get()
  findAll(@Query() params: FilterDto) {
    return this.paymentMethodsService.findAll(params);
  }

  @Get('names')
  findAllNames(@Query() params: FilterDto) {
    return this.paymentMethodsService.findAllNames(params);
  }

  @Get(':id')
  findOne(@Param() urlParams: UUIDDto) {
    return this.paymentMethodsService.findOne({ id: urlParams.id });
  }

  @Patch(':id')
  update(
    @Param() urlParams: UUIDDto,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
    @Request() req,
  ) {
    const params = {
      where: { id: urlParams.id },
      data: updatePaymentMethodDto,
    };
    const { sub } = req.user;
    return this.paymentMethodsService.update(params, sub);
  }

  @Delete('batch')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Subject.ConceptPrices),
  )
  batchRemove(@Body() keys: { key: string[] }) {
    return this.paymentMethodsService.batchRemove(keys);
  }
}

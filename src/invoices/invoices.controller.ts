import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceDto, UUIDDto } from '../models';
import { CheckPolicies, PoliciesGuard } from '../auth/guards/policies.guard';
import { Action, AppAbility, Subject } from '../casl/casl-ability.factory';
import { FilterInvoicesDto } from './dto/filter-invoices-dto';

@UseGuards(AuthGuard('jwt'))
@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, Subject.Invoices),
  )
  create(@Body() createInvoiceDto: InvoiceDto, @Request() req) {
    const { sub } = req.user;
    return this.invoicesService.create(createInvoiceDto, sub);
  }

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, Subject.Invoices),
  )
  findAll(@Query() params: FilterInvoicesDto) {
    return this.invoicesService.findAll(params);
  }

  @Get(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, Subject.Invoices),
  )
  findOne(@Param() urlParams: UUIDDto) {
    return this.invoicesService.findOne({ id: urlParams.id });
  }

  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Subject.Invoices),
  )
  update(
    @Param() urlParams: UUIDDto,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    const params = {
      where: { id: urlParams.id },
      data: updateInvoiceDto,
    };
    return this.invoicesService.update(params);
  }

  @Delete(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Subject.Invoices),
  )
  remove(@Param() urlParams: UUIDDto) {
    return this.invoicesService.remove(urlParams);
  }

  @Delete('batch')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Subject.Invoices),
  )
  batchRemove(@Body() keys: { key: string[] }) {
    return this.invoicesService.batchRemove(keys);
  }
}

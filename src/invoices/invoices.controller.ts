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
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { FilterDto, InvoiceDto, UUIDDto } from '../models';
import { CheckPolicies, PoliciesGuard } from '../auth/guards/policies.guard';
import { Action, AppAbility, Subject } from '../casl/casl-ability.factory';

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
  create(@Body() createInvoiceDto: InvoiceDto, @Request() req: { user: User }) {
    const userId = req.user.id;
    return this.invoicesService.create(createInvoiceDto, userId);
  }

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, Subject.Invoices),
  )
  findAll(@Query() params: FilterDto) {
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
}

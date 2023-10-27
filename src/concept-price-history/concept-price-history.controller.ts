import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ConceptPriceHistoryService } from './concept-price-history.service';
import { ConceptPriceHistoryDto } from '../models/dto/concept-price-history.dto';
import { FilterDto, UUIDDto } from '../models';
import { CheckPolicies, PoliciesGuard } from '../auth/guards/policies.guard';
import { Action, AppAbility, Subject } from '../casl/casl-ability.factory';

@UseGuards(AuthGuard('jwt'))
@ApiTags('concept-price-history')
@Controller('concept-price-history')
export class ConceptPriceHistoryController {
  constructor(
    private readonly conceptPriceHistoryService: ConceptPriceHistoryService,
  ) {}

  @Post()
  create(
    @Body() createConceptPriceHistoryDto: ConceptPriceHistoryDto,
    @Request() req,
  ) {
    const { sub } = req.user;
    return this.conceptPriceHistoryService.create(
      createConceptPriceHistoryDto,
      sub,
    );
  }

  @Get()
  findAll(@Query() params: FilterDto) {
    return this.conceptPriceHistoryService.findAll(params);
  }

  @Get(':id')
  findOne(@Param() urlParams: UUIDDto) {
    return this.conceptPriceHistoryService.findOne({ id: urlParams.id });
  }

  @Delete('batch')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Subject.ConceptPrices),
  )
  batchRemove(@Body() keys: { key: string[] }) {
    return this.conceptPriceHistoryService.batchRemove(keys);
  }
}

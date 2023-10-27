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
import { ConceptsService } from './concepts.service';
import { UpdateConceptDto } from './dto/update-concept.dto';
import { ConceptDto, FilterDto, UUIDDto } from '../models';
import { CheckPolicies, PoliciesGuard } from '../auth/guards/policies.guard';
import { Action, AppAbility, Subject } from '../casl/casl-ability.factory';

@UseGuards(AuthGuard('jwt'))
@ApiTags('concepts')
@Controller('concepts')
export class ConceptsController {
  constructor(private readonly conceptsService: ConceptsService) {}

  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, Subject.Concepts),
  )
  create(@Body() createConceptDto: ConceptDto, @Request() req) {
    const { sub } = req.user;

    return this.conceptsService.create(createConceptDto, sub);
  }

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, Subject.Concepts),
  )
  findAll(@Query() params: FilterDto) {
    return this.conceptsService.findAll(params);
  }

  @Get('childs')
  findChildsNames(@Query() params: FilterDto) {
    return this.conceptsService.findChildsNames(params);
  }

  @Get('parents')
  findParentsNames(@Query() params: FilterDto) {
    return this.conceptsService.findParentsNames(params);
  }

  @Get(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Read, Subject.Concepts),
  )
  findOne(@Param() urlParams: UUIDDto) {
    return this.conceptsService.findOne({ id: urlParams.id });
  }

  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Subject.Concepts),
  )
  update(
    @Param() urlParams: UUIDDto,
    @Body() updateConceptDto: UpdateConceptDto,
    @Request() req,
  ) {
    const params = {
      where: { id: urlParams.id },
      data: updateConceptDto,
    };
    const { sub } = req.user;
    return this.conceptsService.update(params, sub);
  }

  @Delete('batch')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Subject.Concepts),
  )
  batchRemove(@Body() keys: { key: string[] }) {
    return this.conceptsService.batchRemove(keys);
  }
}

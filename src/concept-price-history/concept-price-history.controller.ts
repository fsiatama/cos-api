import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ConceptPriceHistoryService } from './concept-price-history.service';
import { UpdateConceptPriceHistoryDto } from './dto/update-concept-price-history.dto';
import { ConceptPriceHistoryDto } from '../models/dto/concept-price-history.dto';

@Controller('concept-price-history')
export class ConceptPriceHistoryController {
  constructor(
    private readonly conceptPriceHistoryService: ConceptPriceHistoryService,
  ) {}

  @Post()
  create(@Body() createConceptPriceHistoryDto: ConceptPriceHistoryDto) {
    return this.conceptPriceHistoryService.create(createConceptPriceHistoryDto);
  }

  @Get()
  findAll() {
    return this.conceptPriceHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conceptPriceHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConceptPriceHistoryDto: UpdateConceptPriceHistoryDto,
  ) {
    return this.conceptPriceHistoryService.update(
      +id,
      updateConceptPriceHistoryDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conceptPriceHistoryService.remove(+id);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { SuggestionsService } from './suggestions.service';

@ApiTags('suggestions')
@Controller('suggestions')
export class SuggestionsController {
  constructor(private readonly svc: SuggestionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get hero suggestions by category type' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'recruiting | prototype | business | learning | research',
  })
  get(@Query('type') type = 'recruiting') {
    return this.svc.getByType(type);
  }
}

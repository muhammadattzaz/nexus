import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ModelsService } from './models.service';

@ApiTags('models')
@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all AI models (static catalog)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'provider', required: false })
  @ApiQuery({ name: 'tier', required: false })
  findAll(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('provider') provider?: string,
    @Query('tier') tier?: string,
  ) {
    return this.modelsService.findAll({ search, type, provider, tier });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific AI model by ID' })
  findOne(@Param('id') id: string) {
    const model = this.modelsService.findOne(id);
    if (!model) throw new NotFoundException(`Model '${id}' not found`);
    return model;
  }
}

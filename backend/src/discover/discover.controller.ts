import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DiscoverService } from './discover.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('discover')
@Controller('discover')
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get research papers feed' })
  findAll(@Query('category') category?: string) {
    return this.discoverService.findAll(category);
  }

  @Public()
  @Get(':category')
  @ApiOperation({ summary: 'Get papers by category' })
  findByCategory(@Param('category') category: string) {
    return this.discoverService.findByCategory(category);
  }

  @Public()
  @Get('seed/run')
  @ApiOperation({ summary: 'Seed research papers' })
  seed() {
    return this.discoverService.seed();
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MarketplaceService } from './marketplace.service';
import { CreateItemDto } from './dto/create-item.dto';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Public()
  @Get('items')
  @ApiOperation({ summary: 'Get all marketplace items with optional filters' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'provider', required: false })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('type') type?: string,
    @Query('provider') provider?: string,
    @Query('minRating') minRating?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('search') search?: string,
  ) {
    return this.marketplaceService.findAll({
      type,
      provider,
      minRating,
      maxPrice,
      search,
    });
  }

  @Public()
  @Post('seed')
  @ApiOperation({ summary: 'Seed marketplace items (skips if already seeded)' })
  seed() {
    return this.marketplaceService.seed();
  }

  @UseGuards(JwtAuthGuard)
  @Post('items')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new marketplace item' })
  create(@Body() dto: CreateItemDto) {
    return this.marketplaceService.create(dto);
  }

  @Public()
  @Get('items/:id')
  @ApiOperation({ summary: 'Get a specific marketplace item' })
  findOne(@Param('id') id: string) {
    return this.marketplaceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('items/:id/purchase')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase a marketplace item' })
  purchase(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.marketplaceService.purchase(user.userId, id);
  }
}

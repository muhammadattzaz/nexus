import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@ApiTags('agents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all agents for current user' })
  findAll(@CurrentUser() user: { userId: string }) {
    return this.agentsService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific agent by ID' })
  findOne(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.agentsService.findOne(user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new agent' })
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateAgentDto,
  ) {
    return this.agentsService.create(user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing agent' })
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateAgentDto,
  ) {
    return this.agentsService.update(user.userId, id, dto);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed sample agents for the current user (skips if already seeded)' })
  seed(@CurrentUser() user: { userId: string }) {
    return this.agentsService.seedForUser(user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an agent' })
  remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.agentsService.remove(user.userId, id);
  }
}

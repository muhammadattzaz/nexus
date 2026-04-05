import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'Get all chat sessions for current user' })
  getSessions(@CurrentUser() user: { userId: string }) {
    return this.chatService.getSessions(user.userId);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new chat session' })
  createSession(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateSessionDto,
  ) {
    return this.chatService.createSession(user.userId, dto);
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: 'Get messages for a chat session' })
  getMessages(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.chatService.getMessages(user.userId, id);
  }

  @Post('sessions/:id/messages')
  @ApiOperation({ summary: 'Add a message to a chat session' })
  addMessage(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.chatService.addMessage(user.userId, id, dto);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Delete a chat session' })
  deleteSession(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.chatService.deleteSession(user.userId, id);
  }
}

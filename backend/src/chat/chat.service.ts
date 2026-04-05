import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { ChatSession, ChatSessionDocument } from './schemas/chat-session.schema';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatSession.name)
    private chatSessionModel: Model<ChatSessionDocument>,
  ) {}

  async getSessions(userId: string) {
    return this.chatSessionModel
      .find({ userId } as QueryFilter<ChatSessionDocument>)
      .sort({ updatedAt: -1 })
      .lean();
  }

  async createSession(userId: string, dto: CreateSessionDto) {
    const session = await this.chatSessionModel.create({
      userId: userId as any,
      title: dto.title,
      modelId: dto.modelId,
      modelName: dto.modelName,
      messages: [],
    });
    return session.toObject();
  }

  async getMessages(userId: string, sessionId: string) {
    const session = await this.chatSessionModel
      .findById(sessionId)
      .lean();

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session.messages;
  }

  async addMessage(userId: string, sessionId: string, dto: CreateMessageDto) {
    const session = await this.chatSessionModel.findById(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const message = {
      role: dto.role,
      content: dto.content,
      attachments: dto.attachments || [],
      createdAt: new Date(),
    };

    session.messages.push(message as any);
    await session.save();

    return message;
  }

  async deleteSession(userId: string, sessionId: string) {
    const result = await this.chatSessionModel.findByIdAndDelete(sessionId);

    if (!result) {
      throw new NotFoundException('Session not found');
    }

    return { success: true, message: 'Session deleted' };
  }
}

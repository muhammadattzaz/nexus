import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });

      client.data.userId = payload.sub;
      client.data.email = payload.email;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Clean up on disconnect
  }

  @SubscribeMessage('join_session')
  async handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    if (!client.data.userId) {
      throw new WsException('Unauthorized');
    }
    await client.join(data.sessionId);
    return { event: 'joined', sessionId: data.sessionId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      sessionId: string;
      role: string;
      content: string;
      attachments?: any[];
    },
  ) {
    if (!client.data.userId) {
      throw new WsException('Unauthorized');
    }

    try {
      const message = await this.chatService.addMessage(
        client.data.userId,
        data.sessionId,
        {
          role: data.role,
          content: data.content,
          attachments: data.attachments,
        },
      );

      this.server.to(data.sessionId).emit('new_message', {
        sessionId: data.sessionId,
        message,
      });

      return { success: true, message };
    } catch (error) {
      throw new WsException(error.message || 'Failed to send message');
    }
  }

  @SubscribeMessage('leave_session')
  async handleLeaveSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    await client.leave(data.sessionId);
    return { event: 'left', sessionId: data.sessionId };
  }
}

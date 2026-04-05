import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ChatSessionDocument = HydratedDocument<ChatSession>;

class Attachment {
  @Prop()
  type: string;

  @Prop()
  url: string;

  @Prop()
  name: string;

  @Prop()
  size: number;
}

class Message {
  @Prop({ enum: ['user', 'assistant', 'system'], required: true })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [{ type: Object }], default: [] })
  attachments: Attachment[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class ChatSession {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  modelId: string;

  @Prop({ required: true })
  modelName: string;

  @Prop({ type: [Object], default: [] })
  messages: Message[];
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);

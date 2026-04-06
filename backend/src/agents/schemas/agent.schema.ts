import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type AgentDocument = HydratedDocument<Agent>;

class AgentMemory {
  @Prop({ default: true })
  shortTerm: boolean;

  @Prop({ default: false })
  longTerm: boolean;
}

class AgentMetrics {
  @Prop({ default: 0 })
  messages: number;

  @Prop({ default: 0 })
  avgLatency: number;

  @Prop({ default: 0 })
  tokensUsed: number;
}

@Schema({ timestamps: true })
export class Agent {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    required: true,
    enum: [
      'customer-support',
      'research',
      'code-review',
      'content-writing',
      'email-outreach',
      'analytics',
      'education',
      'ecommerce',
    ],
  })
  type: string;

  @Prop()
  systemPrompt: string;

  @Prop({ type: [String], default: [] })
  tools: string[];

  @Prop({ type: Object, default: {} })
  toolConfigs: Record<string, Record<string, string>>;

  @Prop({ type: Object, default: { shortTerm: true, longTerm: false } })
  memory: AgentMemory;

  @Prop()
  model: string;

  @Prop()
  tone: string;

  @Prop()
  audience: string;

  @Prop({ enum: ['draft', 'deployed'], default: 'draft' })
  status: string;

  @Prop({
    type: Object,
    default: { messages: 0, avgLatency: 0, tokensUsed: 0 },
  })
  metrics: AgentMetrics;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);

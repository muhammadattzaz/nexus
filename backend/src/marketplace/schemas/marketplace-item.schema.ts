import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MarketplaceItemDocument = HydratedDocument<MarketplaceItem>;

class Pricing {
  @Prop({ default: 0 })
  inputPer1M: number;

  @Prop({ default: 0 })
  outputPer1M: number;

  @Prop({ default: 'free' })
  tier: string;
}

@Schema({ timestamps: true })
export class MarketplaceItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  provider: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    enum: ['llm', 'image', 'audio', 'embedding', 'multimodal', 'code', 'vision', 'tool'],
    required: true,
  })
  type: string;

  @Prop({ enum: ['hot', 'new', 'open'] })
  badge: string;

  @Prop({ type: Object, default: { inputPer1M: 0, outputPer1M: 0, tier: 'free' } })
  pricing: Pricing;

  @Prop({ default: 0 })
  contextWindow: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop()
  license: string;

  @Prop({ default: false })
  featured: boolean;
}

export const MarketplaceItemSchema = SchemaFactory.createForClass(MarketplaceItem);

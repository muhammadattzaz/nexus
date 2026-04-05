import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaperDocument = Paper & Document;

@Schema({ timestamps: true })
export class Paper {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  summary: string;

  @Prop({ required: true })
  lab: string;

  @Prop({
    required: true,
    enum: ['reasoning', 'multimodal', 'alignment', 'efficiency', 'open-weights'],
  })
  category: string;

  @Prop({ required: true })
  publishedAt: Date;

  @Prop({ type: [{ label: String, value: String }], default: [] })
  stats: Array<{ label: string; value: string }>;

  @Prop({ type: [String], default: [] })
  models: string[];

  @Prop()
  discussPrompt: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  bookmarks: Types.ObjectId[];
}

export const PaperSchema = SchemaFactory.createForClass(Paper);

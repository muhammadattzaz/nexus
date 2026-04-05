import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ select: false })
  refreshTokenHash: string;

  @Prop()
  avatar: string;

  @Prop({ default: 'en' })
  language: string;

  @Prop({ enum: ['free', 'pro', 'enterprise'], default: 'free' })
  plan: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EnrichedUserDocument = EnrichedUser & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class EnrichedUser {
  uuid: string;
  name: string;
  email: string;
  enrichmentData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<EnrichedUser>) {
    Object.assign(this, {
      ...data,
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date(),
    });
  }
}

export const EnrichedUserSchema = SchemaFactory.createForClass(EnrichedUser); 
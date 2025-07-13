import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EnrichedUserDocument = EnrichedUser & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret: any) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class EnrichedUser {
  @Prop({ required: true })
  uuid: string;
  
  @Prop({ required: true })
  name: string;
  
  @Prop()
  email: string;
  
  @Prop({ type: Object })
  enrichmentData: Record<string, any>;
  
  @Prop({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed';
  
  @Prop({ default: 0 })
  retryCount: number;
  
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
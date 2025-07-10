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
  @Prop({ required: true, unique: true })
  uuid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: Object })
  enrichmentData: {
    age?: number;
    gender?: string;
    nationality?: string;
    // Outros dados de enriquecimento podem ser adicionados aqui
  };

  @Prop({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed';

  @Prop()
  error?: string;

  @Prop({ default: 0 })
  retryCount: number;

  constructor(partial: Partial<EnrichedUser>) {
    Object.assign(this, partial);
  }

  public incrementRetryCount(): void {
    this.retryCount += 1;
  }

  public markAsCompleted(): void {
    this.status = 'completed';
  }

  public markAsFailed(error: string): void {
    this.status = 'failed';
    this.error = error;
  }

  public isMaxRetriesExceeded(maxRetries: number): boolean {
    return this.retryCount >= maxRetries;
  }
}

export const EnrichedUserSchema = SchemaFactory.createForClass(EnrichedUser); 
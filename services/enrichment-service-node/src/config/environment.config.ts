import { IsString, IsNumber, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class EnvironmentVariables {
  @IsString()
  MONGODB_URI: string;

  @IsString()
  RABBITMQ_URI: string;

  @IsString()
  RABBITMQ_QUEUE: string;

  @IsString()
  RABBITMQ_DLX: string;

  @IsString()
  RABBITMQ_DLQ: string;

  @IsNumber()
  RETRY_ATTEMPTS: number;

  @IsNumber()
  RETRY_DELAY: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
} 
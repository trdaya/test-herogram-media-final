import { plainToInstance } from 'class-transformer';
import {
  IsString,
  IsNumber,
  validateSync,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  PORT: number = 4001;

  @IsString()
  TZ: string = 'UTC';

  @IsString()
  @IsNotEmpty()
  MONGO_URI: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string = '10m';

  @IsString()
  ACCESS_TOKEN_EXPIRES_IN: string = '90s';

  @IsString()
  REFRESH_TOKEN_EXPIRES_IN: string = '4m';

  @IsString()
  @IsNotEmpty()
  CORS_ALLOWED_ORIGINS: string;

  @IsString()
  @IsNotEmpty()
  COOKIE_SECURE: string;

  @IsString()
  @IsNotEmpty()
  COOKIE_SAME_SITE: string;

  @IsString()
  @IsNotEmpty()
  AWS_REGION: string;

  @IsString()
  @IsNotEmpty()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_BUCKET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig);
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

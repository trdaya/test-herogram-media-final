import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { pinoLoggerConfig } from './logger/pino-logger.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { FileModule } from './file/file.module';
import { validate } from './config/env.validation';
import { EnvVariablesEnum } from './enums/env.enum';

@Module({
  imports: [
    ConfigModule.forRoot({ validate, isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(EnvVariablesEnum.MONGO_URI),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false,
      }),
    }),
    AuthModule,
    UserModule,
    LoggerModule.forRoot(pinoLoggerConfig),
    FileModule,
  ],
})
export class AppModule {}

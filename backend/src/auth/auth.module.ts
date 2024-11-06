import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserSchema, User } from '../user/schemas/user.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvVariablesEnum } from '../enums/env.enum';
import { JwtUtils } from '../utils/jwt.utils';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(EnvVariablesEnum.JWT_SECRET),
        signOptions: {
          expiresIn: configService.get<string>(
            EnvVariablesEnum.JWT_EXPIRES_IN,
            '10m'
          ),
        },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtUtils],
  exports: [AuthService, JwtModule, JwtUtils],
})
export class AuthModule {}

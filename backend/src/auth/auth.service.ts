import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { EnvVariablesEnum } from '../enums/env.enum';
import { ErrorMessageEnum } from '../enums/error-messages.enum';
import { User, UserDocument } from '../user/schemas/user.schema';
import { SignInDto, SignUpDto } from './dtos/auth.dto';
import { JwtUtils } from '../utils/jwt.utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private jwtUtils: JwtUtils,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  generateRefreshToken(userId: string) {
    this.logger.log(`Generating refresh token for user ID: ${userId}`);

    return this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>(EnvVariablesEnum.JWT_SECRET),
        expiresIn: this.configService.get<string>(
          EnvVariablesEnum.REFRESH_TOKEN_EXPIRES_IN
        ),
      }
    );
  }

  generateAccessToken(userId: string) {
    this.logger.log(`Generating access token for user ID: ${userId}`);

    return this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>(EnvVariablesEnum.JWT_SECRET),
        expiresIn: this.configService.get<string>(
          EnvVariablesEnum.ACCESS_TOKEN_EXPIRES_IN
        ),
      }
    );
  }

  async signUp({ email, password, name }: SignUpDto) {
    this.logger.log(`Attempting sign up for email: ${email}`);

    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      this.logger.warn(`User with email ${email} already exists`);
      throw new ConflictException(ErrorMessageEnum.INTERNAL_SERVER_ERROR);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      email,
      name,
      password: hashedPassword,
    });

    this.logger.log(`User successfully signed up with email: ${email}`);

    const { password: _, ...safeUser } = user.toObject();
    return safeUser;
  }

  async signIn({ email, password }: SignInDto) {
    this.logger.log(`Attempting sign in for email: ${email}`);

    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      this.logger.log(`User with email ${email} successfully authenticated`);

      const refreshToken = this.generateRefreshToken(user._id.toString());
      const accessToken = this.generateAccessToken(user._id.toString());

      return {
        refreshToken,
        accessToken,
      };
    }

    this.logger.warn(`Invalid credentials for email: ${email}`);
    throw new UnauthorizedException(ErrorMessageEnum.INVALID_CREDENTIALS);
  }

  async refreshAccessToken(userId: string, refreshToken: string) {
    this.logger.log(
      `Attempting to refresh access token for user ID: ${userId}`
    );

    const isRefreshTokenValid = this.jwtUtils.verifyToken(refreshToken);
    if (!isRefreshTokenValid) {
      this.logger.warn(`Invalid refresh token for user ID: ${userId}`);
      throw new UnauthorizedException(ErrorMessageEnum.INVALID_REFRESH_TOKEN);
    }

    this.logger.log(
      `Successfully refreshed access token for user ID: ${userId}`
    );
    return {
      accessToken: this.generateAccessToken(userId),
    };
  }
}

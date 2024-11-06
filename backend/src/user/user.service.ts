import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { ErrorMessageEnum } from '../enums/error-messages.enum';
import { UserResponseDto } from './dtos/user.dtos';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async getUserProfile(userId: string) {
    this.logger.log(`Fetching user profile for user ID: ${userId}`);

    const user = await this.userModel.findById(userId).lean();

    if (!user) {
      this.logger.warn(`User not found for ID: ${userId}`);
      throw new NotFoundException(ErrorMessageEnum.USER_PROFILE_NOT_AVAILABLE);
    }

    this.logger.log(`User profile fetched for user ID: ${userId}`);
    return plainToInstance(UserResponseDto, user);
  }
}

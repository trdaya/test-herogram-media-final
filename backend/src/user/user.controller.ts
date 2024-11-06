import { Controller, Get, Req, UseGuards, Version } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'User profile not available.' })
  @Version('1')
  @Get('profile')
  async getUserProfile(@Req() req: Request) {
    return this.userService.getUserProfile(req.user._id);
  }
}

import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { EnvVariablesEnum } from '../enums/env.enum';
import { ErrorMessageEnum } from '../enums/error-messages.enum';
import { JwtUtils } from '../utils/jwt.utils';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dtos/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtUtils: JwtUtils,
    private readonly configService: ConfigService,
    private jwtService: JwtService
  ) {}

  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully signed up.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request.',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists.',
    schema: {
      example: {
        statusCode: 409,
        message: ErrorMessageEnum.INTERNAL_SERVER_ERROR,
      },
    },
  })
  @Version('1')
  @Post('signup')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully signed in.',
    schema: {
      example: {
        accessToken: 'JWT access token',
        refreshToken: 'JWT refresh token',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: `Invalid credentials. Error code: ${ErrorMessageEnum.INVALID_CREDENTIALS}`,
    schema: {
      example: {
        statusCode: 401,
        message: ErrorMessageEnum.INVALID_CREDENTIALS,
      },
    },
  })
  @Version('1')
  @HttpCode(200)
  @Post('signin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.authService.signIn(signInDto);

    const decodedRefreshToken = this.jwtService.decode(refreshToken) as {
      exp: number;
    };
    const maxAgeRefreshToken = decodedRefreshToken.exp * 1000 - Date.now();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:
        this.configService.get<string>(EnvVariablesEnum.COOKIE_SECURE) ===
        'true',
      sameSite: this.configService.get<'lax' | 'strict' | 'none'>(
        EnvVariablesEnum.COOKIE_SAME_SITE
      ),
      maxAge: maxAgeRefreshToken,
    });

    return res.json({ accessToken });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Access token successfully refreshed.',
    schema: {
      example: {
        accessToken: 'JWT access token',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: `Invalid refresh token. Error code: ${ErrorMessageEnum.INVALID_REFRESH_TOKEN}`,
    schema: {
      example: {
        statusCode: 401,
        message: `${ErrorMessageEnum.INVALID_REFRESH_TOKEN}`,
      },
    },
  })
  @Version('1')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('refresh-access-token')
  async refreshAccessToken(@Req() req) {
    const refreshToken = req.cookies['refreshToken'];
    const payload = this.jwtUtils.verifyToken(refreshToken);
    if (!payload)
      throw new UnauthorizedException(ErrorMessageEnum.INVALID_REFRESH_TOKEN);

    return this.authService.refreshAccessToken(payload.userId, payload.token);
  }

  @Version('1')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('logout')
  async logout(@Req() req, @Res() res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:
        this.configService.get<string>(EnvVariablesEnum.COOKIE_SECURE) ===
        'true',
      sameSite: this.configService.get<'lax' | 'strict' | 'none'>(
        EnvVariablesEnum.COOKIE_SAME_SITE
      ),
      path: '/',
      expires: new Date(0),
    });
    return res.json();
  }
}

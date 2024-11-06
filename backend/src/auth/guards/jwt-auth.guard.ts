import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtUtils } from '../../utils/jwt.utils';
import { ErrorMessageEnum } from '../../enums/error-messages.enum';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtUtils: JwtUtils) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.jwtUtils.extractTokenFromHeader(request);

    if (!token)
      throw new UnauthorizedException(ErrorMessageEnum.INVALID_ACCESS_TOKEN);

    const payload = this.jwtUtils.verifyToken(token);

    if (!payload)
      throw new UnauthorizedException(ErrorMessageEnum.INVALID_ACCESS_TOKEN);

    request.user = { _id: payload.userId };
    request.token = token;
    return true;
  }
}

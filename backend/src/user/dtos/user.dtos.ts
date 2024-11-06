import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;

  @Exclude()
  password?: string;
}

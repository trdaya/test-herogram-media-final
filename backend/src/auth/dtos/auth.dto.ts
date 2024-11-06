import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    example: 'example@example.com',
    description: 'The email address of the user',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
  })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      'The password of the user. Must be between 8 and 20 characters, and contain at least one letter, one number, and one special character from @$!%*?&',
    minLength: 8,
    maxLength: 20,
  })
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  @Matches(/(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/, {
    message:
      'Password must contain at least one letter, one number, and one special character from @$!%*?&',
  })
  password: string;
}

export class SignInDto {
  @ApiProperty({
    example: 'example@example.com',
    description: 'The email address of the user',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'The password of the user',
  })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;
}

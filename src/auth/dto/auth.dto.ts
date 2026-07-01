import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthenticationDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 5,
    maxLength: 20,
  })
  @IsString()
  @Length(5, 20)
  name: string;

  @ApiProperty({
    description: 'Unique email address for user account',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Secure password for user account',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthenticationDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User Registration',
    description:
      'Register a new user account. The password will be securely hashed using bcrypt before storage. Email must be unique across all user accounts.',
  })
  @ApiBody({
    type: AuthenticationDto,
    description: 'User registration credentials',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'User successfully registered. Returns user data without the password hash.',
    example: {
      message: 'Sign up was successful',
      user: {
        id: 'uuid-string',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'BUYER',
        phone: null,
        createdAt: '2026-06-30T00:00:00.000Z',
        updatedAt: '2026-06-30T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email already registered or validation failed',
    example: {
      statusCode: 400,
      message: 'This user has been registered',
      error: 'Bad Request',
    },
  })
  signUp(@Body() authenticationDto: AuthenticationDto) {
    return this.authService.signUp(authenticationDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticate user with email and password. Password is verified against the stored hash. Returns user data without sensitive information on successful authentication.',
  })
  @ApiBody({
    type: AuthenticationDto,
    description: 'User login credentials (name field is optional for signin)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully authenticated. Returns user data.',
    example: {
      message: 'Sign in was successful',
      user: {
        id: 'uuid-string',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'BUYER',
        phone: null,
        createdAt: '2026-06-30T00:00:00.000Z',
        updatedAt: '2026-06-30T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid email or password',
    example: {
      statusCode: 401,
      message: 'Invalid email or password',
      error: 'Unauthorized',
    },
  })
  signIn(@Body() authenticationDto: AuthenticationDto) {
    return this.authService.signIn(
      authenticationDto.email,
      authenticationDto.password,
    );
  }

  @Get('signout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Logout',
    description:
      'Terminate user session. This endpoint should be called when user logs out to clear client-side session state.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged out',
    example: {
      message: 'Sign out was successful',
    },
  })
  signOut() {
    return this.authService.signOut();
  }
}

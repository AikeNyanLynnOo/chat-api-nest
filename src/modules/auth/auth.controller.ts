import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpDto } from './dtos/signup.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { SignInDto } from './dtos/signin.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // sign up
  @Post('sign-up')
  @ApiOperation({ summary: 'User Sign Up' })
  @ApiBody({ type: SignUpDto, description: 'User Sign Up Data' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully signed up.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data in body',
  })
  async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    return await this.authService.signUp(signUpDto, res);
  }

  // sign in
  @Post('sign-in')
  @ApiOperation({ summary: 'User Sign In' })
  @ApiBody({
    type: SignInDto,
    description: 'User Sign In data (email & password)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully signed in. Tokens set in httpOnly cookie.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data in body',
  })
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    return await this.authService.signIn(signInDto, res);
  }
}

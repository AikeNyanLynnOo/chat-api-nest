import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpDto } from './dtos/signup.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { SignInDto } from './dtos/signin.dto';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { User } from '../user/entities';

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

  // sign out
  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'User Sign Out' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully signed out. Tokens removed',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Sign out failed',
  })
  async signOut(
    @CurrentUser() user: Partial<User>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.authService.signOut(user, req, res);
  }

  // refresh access token
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refreshing Access Token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access token successfully refreshed.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description:
      'Invalid or expired refresh token. Please sign in first to get refresh token',
  })
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    return await this.authService.refreshAccessToken(req, res);
  }
}

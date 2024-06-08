import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { SignUpDto } from './dtos/signup.dto';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptPromise = promisify(scrypt);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto, res: Response) {
    try {
      const { password, ...userInfo } = signUpDto;

      const checkUser = await this.userService.findUserByEmail(userInfo.email);
      if (checkUser) {
        return res.status(HttpStatus.CONFLICT).json({
          status: HttpStatus.CONFLICT,
          message: 'Email already exists',
        });
      }

      let hashedPassword: string;
      // hashing password
      try {
        const salt = randomBytes(parseInt(process.env.SALT_LENGTH));
        const derivedKey: any = await scryptPromise(password, salt, 64);
        hashedPassword = `${salt.toString('base64')}:${derivedKey.toString('base64')}`;
      } catch (error) {
        throw new HttpException(
          'Error hashing password',
          HttpStatus.BAD_REQUEST,
        );
      }
      const user = await this.userService.createUser({
        ...userInfo,
        hashedPassword,
      });

      const { id, email } = user;
      const accessToken = this.generateAccessToken({
        id,
        email,
      });
      const refreshToken = this.generateAccessToken({
        id,
        email,
      });
      await this.userService.update(id, { refreshToken });

      res.cookie(process.env.ACCESS_TOKEN_NAME, refreshToken, {
        httpOnly: true,
        maxAge: 20 * 60 * 1000,
      });

      res.cookie(process.env.REFRESH_TOKEN_NAME, refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(HttpStatus.CREATED).json({
        status: HttpStatus.CREATED,
        message: 'User is signed up successfully.',
        data: {
          accessToken,
          ...user,
        },
      });
    } catch (error) {
      this.logger.error('An error occured while trying to sign up.', error);

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An error occured during sign-up. Please try again later.',
      });
    }
  }
  private generateAccessToken({
    id,
    email,
  }: {
    id: string;
    email: string;
  }): string {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    const accessToken = this.jwtService.sign(
      { id, email },
      { secret: ACCESS_TOKEN_SECRET, expiresIn: '20m' },
    );
    return accessToken;
  }

  private generateRefreshToken({
    id,
    email,
  }: {
    id: string;
    email: string;
  }): string {
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    const refreshToken = this.jwtService.sign(
      { id, email },
      { secret: REFRESH_TOKEN_SECRET, expiresIn: '1d' },
    );
    return refreshToken;
  }
}

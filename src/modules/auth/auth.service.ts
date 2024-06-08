import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { SignUpDto } from './dtos/signup.dto';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { SignInDto } from './dtos/signin.dto';
import { removeSensitiveDataUser } from 'src/utils/helpers/remove-sensitive-data-users';
import { User } from '../user/entities';

const scryptPromise = promisify(scrypt);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  // POST SIGN UP
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
      //   const accessToken = this.generateAccessToken({
      //     id,
      //     email,
      //   });
      const refreshToken = this.generateRefreshToken({
        id,
        email,
      });
      await this.userService.update(id, { refreshToken });

      //   res.cookie(process.env.ACCESS_TOKEN_NAME, accessToken, {
      //     httpOnly: true,
      //     maxAge: 20 * 60 * 1000,
      //   });

      //   res.cookie(process.env.REFRESH_TOKEN_NAME, refreshToken, {
      //     httpOnly: true,
      //     maxAge: 24 * 60 * 60 * 1000,
      //   });

      return res.status(HttpStatus.CREATED).json({
        status: HttpStatus.CREATED,
        message: 'User is signed up successfully.',
        data: {
          //   accessToken,
          ...user,
        },
      });
    } catch (error) {
      this.logger.error('An error occured while trying to sign up.', error);

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An error occured during sign-up. Please try again later.',
      });
    }
  }

  // POST SIGN IN
  async signIn(signInDto: SignInDto, res: Response) {
    const { email, password } = signInDto;
    try {
      const user = await this.userService.findUserByEmail(email);

      if (!user) {
        this.logger.warn(`Invalid email ${email}`);
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: 'Email address not yet registered.',
        });
      }

      const [saltBase64, hashBase64] = user.hashedPassword.split(':');
      const salt = Buffer.from(saltBase64, 'base64');
      const hashBuffer = Buffer.from(hashBase64, 'base64');
      const derivedKey: any = await scryptPromise(password, salt, 64);

      const passwordMatch = timingSafeEqual(derivedKey, hashBuffer);
      if (!passwordMatch) {
        this.logger.warn(`Invalid password`);
        return res.status(HttpStatus.UNAUTHORIZED).json({
          status: HttpStatus.UNAUTHORIZED,
          message: 'Incorrect password.',
        });
      }

      const accessToken = this.generateAccessToken({
        id: user.id,
        email: user.email,
      });
      const refreshToken = this.generateRefreshToken({
        id: user.id,
        email: user.email,
      });
      await this.userService.update(user.id, { refreshToken });

      res.cookie(process.env.ACCESS_TOKEN_NAME, accessToken, {
        httpOnly: true,
        maxAge: 20 * 60 * 1000, // 20m
      });

      res.cookie(process.env.REFRESH_TOKEN_NAME, refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1d
      });

      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'User is signed in successfully.',
        data: {
          accessToken,
          refreshToken,
          user: removeSensitiveDataUser(user),
        },
      });
    } catch (error) {
      this.logger.error('An error occured while trying to sign in.', error);

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An error occured during sign-up. Please try again later.',
      });
    }
  }

  // POST SIGN OUT
  async signOut(user: Partial<User>, req: Request, res: Response) {
    console.log('User ID>>>>>', user.id);

    if (!user || !user.id) {
      this.logger.warn(`User ID is not provided`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'User ID is not provided',
      });
    }

    try {
      await this.userService.update(user.id, { refreshToken: null });
      res.clearCookie(process.env.ACCESS_TOKEN_NAME);
      res.clearCookie(process.env.REFRESH_TOKEN_NAME);
      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'User is signed out successfully.',
      });
    } catch (error) {
      this.logger.error('An error occurred during sign-out.', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An error occurred during sign-out. Please try again later.',
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

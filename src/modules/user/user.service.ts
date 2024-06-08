import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto, PureUserDto } from './dtos';
import { removeSensitiveDataUser } from 'src/utils/helpers/remove-sensitive-data-users';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // GET ALL USERS
  async findAll(): Promise<PureUserDto[]> {
    try {
      const users = await this.userRepository.find();
      return users.map((user) => removeSensitiveDataUser(user));
    } catch (error) {
      this.logger.error(
        `Failed to retrieve all users: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve all users');
    }
  }

  // FIND USER BY ID
  async findOne(userId: string): Promise<PureUserDto> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        this.logger.warn(`User with ID "${userId}" not found`);
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }
      return removeSensitiveDataUser(user);
    } catch (error) {
      this.logger.error(`Failed to find user: ${error.message}`, error.stack);
      throw new NotFoundException(`Failed to find user with ID "${userId}"`);
    }
  }

  // FIND USER BY EMAIL
  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email,
        },
      });
      if (!user) {
        this.logger.warn(`User with email "${email}" not found`);
        // throw new NotFoundException(`User with email "${email}" not found`);
        return null;
      }
      // return includeCredentials ? user : removeSensitiveDataUser(user);
      return user;
    } catch (error) {
      this.logger.error(`Failed to find user: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to find user with email "${email}"`,
      );
    }
  }

  // CREATE NEW USER
  async createUser(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      const savedUser = await this.userRepository.save(user);
      return removeSensitiveDataUser(savedUser);
    } catch (error) {
      this.logger.error(
        `Failed to create new user: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create new user');
    }
  }

  // UPDATE USER
  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<PureUserDto> {
    try {
      const user = await this.findOne(userId);
      if (!user) {
        this.logger.warn(`User with ID "${userId}" not found`);
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }
      Object.assign(user, updateUserDto);
      const saveUser = await this.userRepository.save(user);
      return removeSensitiveDataUser(saveUser);
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`, error.stack);

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        `Failed to update user with ID "${userId}"`,
      );
    }
  }

  // DELETE USER
  async delete(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        this.logger.warn(`User with ID "${userId}" not found`);
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }

      await this.userRepository.delete({ id: user.id });

      return {
        message: 'Successfully deleted.',
        data: removeSensitiveDataUser(user),
      };
    } catch (error) {
      this.logger.error(`Failed to remove user: ${error.message}`, error.stack);

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        `Failed to remove user with ID "${userId}"`,
      );
    }
  }
}

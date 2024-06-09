import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectedUser } from '../entities';
import { DeleteResult, Repository } from 'typeorm';
import { WsException } from '@nestjs/websockets';
import { removeSensitiveDataUser } from 'src/utils/helpers/remove-sensitive-data-users';
import { ResultCount } from 'src/types/result-count.type';
import { ConnectedUserDto } from '../dtos';
@Injectable()
export class ConnectedUserService {
  private readonly logger = new Logger(ConnectedUserService.name);

  constructor(
    @InjectRepository(ConnectedUser)
    private readonly connectedUserRepository: Repository<ConnectedUser>,
  ) {}

  // Read all connected users
  async getAll(): Promise<ResultCount<ConnectedUserDto>> {
    try {
      const [result, total] = await this.connectedUserRepository.findAndCount({
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });

      const pureUserInfo = result.map((connectedUser) => {
        const { user } = connectedUser;
        return {
          ...connectedUser,
          user: removeSensitiveDataUser(user),
        };
      });
      return { result: pureUserInfo, total };
    } catch (exception) {
      this.logger.error(`Failed to get all connected users`, exception.stack);
      throw new WsException('Error retrieving connected users from  database');
    }
  }

  // Create connected user (when socket establish)
  async create(userId: string, socketId: string): Promise<ConnectedUser> {
    try {
      const newUserConnection = this.connectedUserRepository.create({
        userId,
        socketId,
      });
      return await this.connectedUserRepository.save(newUserConnection);
    } catch (exception) {
      this.logger.error(
        `Failed to create a connected user for userId: ${userId}`,
        exception.stack,
      );
      throw new WsException('Error creating new user connection to database');
    }
  }

  // Delete conneted user row (when socket disconnected)
  async delete(socketId: string): Promise<DeleteResult> {
    try {
      return await this.connectedUserRepository.delete({ socketId });
    } catch (exception) {
      this.logger.error(
        `Failed to delete the connected user with socketId: ${socketId}`,
        exception.stack,
      );
      throw new WsException('Error removing user connection.');
    }
  }

  async deleteAll(): Promise<void> {
    try {
      await this.connectedUserRepository
        .createQueryBuilder('connectedUser')
        .delete()
        .execute();
    } catch (exception) {
      this.logger.error(
        'Failed to clear the connected user table',
        exception.stack,
      );
      throw new WsException('Error clearing all user connections.');
    }
  }
}

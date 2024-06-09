import { Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../entities';
import { ILike, Repository } from 'typeorm';
import {
  CreateMessageDto,
  DeleteMessageDto,
  FilterMessageDto,
  MessageDto,
} from '../dtos';
import { WsException } from '@nestjs/websockets';
import { ResultCount } from 'src/types/result-count.type';
import { removeSensitiveDataUser } from 'src/utils/helpers/remove-sensitive-data-users';
import { UpdateMessageDto } from '../dtos/update-message.dto';
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  // Create Message
  async create(
    userId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<ResultCount<MessageDto>> {
    try {
      const newMessage = this.messageRepository.create({
        ...createMessageDto,
        createdBy: userId,
        updatedBy: userId,
      });
      await this.messageRepository.save(newMessage);

      this.logger.log(`Message sent by User ID: ${userId}`);
      return await this.findMessages({ roomId: createMessageDto.roomId });
    } catch (error) {
      this.logger.error(
        `Failed to create message message info - ${JSON.stringify(createMessageDto)}. Error: ${error.message}`,
        error.stack,
      );
      throw new WsException(
        'An error occurred while creating the message. Please try again.',
      );
    }
  }

  // Get messages
  async findMessages(
    filterMessageDto: FilterMessageDto,
  ): Promise<ResultCount<MessageDto>> {
    const { first = 0, rows = 20, filter = '', roomId } = filterMessageDto;

    try {
      const [result, total] = await this.messageRepository.findAndCount({
        where: { text: ILike(`%${filter}%`), roomId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: rows,
        skip: first,
      });

      const pureMessages = result.map((message) => {
        const { user } = message;
        return { ...message, user: removeSensitiveDataUser(user) };
      });

      return { result: pureMessages, total };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve messages with this filters - ${JSON.stringify(filterMessageDto)}, Error - ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw new WsException(
          error.message || 'The requested resource was not found.',
        );
      }

      if (error instanceof WsException) {
        throw error;
      }

      throw new WsException(
        'An error occurred while fetching messages. Please try again later.',
      );
    }
  }

  // Update existing message
  async update(
    userId: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    const { messageId, text } = updateMessageDto;
    try {
      //   const existingMessage = await this.messageRepository.findOne({
      //     where: { id: messageId },
      //   });

      //   if (!existingMessage) {
      //     this.logger.error(`Message with ID "${messageId}" not found.`);
      //     throw new NotFoundException(
      //       `Message with ID "${messageId}" not found.`,
      //     );
      //   }

      //   if (existingMessage.createdBy !== userId) {
      //     this.logger.error(
      //       `Created user is not matched , created user - ${existingMessage.createdBy}, incoming user - ${userId}`,
      //     );
      //     throw new WsException(
      //       'Access Denied: You can only update your own messages.',
      //     );
      //   }

      await this.findMessageAndCheckAccess(userId, messageId);
      await this.messageRepository.update(
        { id: messageId },
        { text, updatedAt: new Date() },
      );

      this.logger.log(
        `Message ID ${messageId} updated successfully by User ID: ${userId}`,
      );

      return await this.messageRepository.findOne({
        where: {
          id: messageId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update message ${JSON.stringify(updateMessageDto)} by User ID: ${userId}. Error: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw new WsException(
          error.message || 'The requested resource was not found.',
        );
      }

      if (error instanceof WsException) {
        throw error;
      }

      throw new WsException(
        'An error occurred while updating the message. Please try again.',
      );
    }
  }

  // Delete message
  async delete(userId: string, deleteMessageDto: DeleteMessageDto) {
    const { messageIds, roomId } = deleteMessageDto;
    try {
      // Batch delete method
      //   await this.messageRepository.delete({
      //     createdBy: userId,
      //     id: In(deleteMessageDto.messageIds),
      //   });

      // For better debugging , I'll delete each id

      for (const id of messageIds) {
        try {
          await this.findMessageAndCheckAccess(userId, id);
          await this.messageRepository.delete({ id, roomId });
          this.logger.log(
            `Message ID ${id} deleted successfully by User ID: ${userId}`,
          );
        } catch (error) {
          this.logger.error(`Failed operation: ${error.message}`, error.stack);

          if (error instanceof WsException) {
            throw error;
          }

          throw new WsException(
            'An unexpected error occurred. Please try again later.',
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed operation: ${error.message}`, error.stack);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException(
        'An unexpected error occurred. Please try again later.',
      );
    }
  }

  // Find and check access
  async findMessageAndCheckAccess(
    userId: string,
    id: string,
  ): Promise<boolean> {
    try {
      const existingMessage = await this.messageRepository.findOne({
        where: { id },
      });

      if (!existingMessage) {
        this.logger.error(`Message with ID "${id}" not found.`);
        throw new NotFoundException(`Message with ID "${id}" not found.`);
      }

      if (existingMessage.createdBy !== userId) {
        this.logger.error(
          `Created user is not matched , created user - ${existingMessage.createdBy}, incoming user - ${userId}`,
        );
        throw new WsException(
          'Access Denied: You can only update your own messages.',
        );
      }
      this.logger.log(
        `Message found & user have access to update/delete. Message ID -> ${id}, User ID -> ${userId}`,
      );
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new WsException(
          error.message || 'The requested resource was not found.',
        );
      }

      if (error instanceof WsException) {
        throw error;
      }

      throw new WsException(
        'An error occurred while searching and checking accss for the message. Please try again.',
      );
    }
  }
}

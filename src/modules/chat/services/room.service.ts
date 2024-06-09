import { Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Message, Room, RoomParticipantUser } from '../entities';
import { DataSource, Repository } from 'typeorm';
import { MessageService } from './message.service';
import { AssignUsersDto, CreateRoomDto, PureRoomInfoDto } from '../dtos';
import { WsException } from '@nestjs/websockets';
import { removeSensitiveDataUser } from 'src/utils/helpers/remove-sensitive-data-users';
import { ResultCount } from 'src/types/result-count.type';
import { UpdateRoomDto } from '../dtos/update-room.dto';

export class RoomService {
  private readonly logger = new Logger(RoomService.name);
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly messageService: MessageService,
  ) {}

  // Create new room
  async create(userId: string, createRoomDto: CreateRoomDto): Promise<Room> {
    const { participants, ...roomInfo } = createRoomDto;

    try {
      const newRoom = this.roomRepository.create({
        ...roomInfo,
        createdBy: userId,
        updatedBy: userId,
      });
      const room = await this.roomRepository.save(newRoom);

      if (participants && participants.length > 0) {
        participants.push(userId);
        await this.assignUsersToRoom(userId, {
          roomId: room.id,
          participants,
        });
      }

      this.logger.log(
        `Room with ID ${room.id} created successfully by User ID: ${userId}`,
      );
      return room;
    } catch (error) {
      this.logger.error(`Failed to create room: ${error.message}`, error.stack);
      throw new WsException('Error occurred while creating the room.');
    }
  }

  // Get all rooms
  async findAll(): Promise<ResultCount<PureRoomInfoDto>> {
    try {
      const [result, total] = await this.roomRepository.findAndCount({
        relations: ['participants'],
      });
      const pureRoomInfo = result.map((room) => {
        const { participants } = room;
        return {
          ...room,
          participants: participants.map((participant) =>
            removeSensitiveDataUser(participant),
          ),
        };
      });
      this.logger.log('All rooms retrieved successfully');
      return { result: pureRoomInfo, total };
    } catch (error) {
      this.logger.error(
        `Failed to find all rooms: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while retrieving rooms.');
    }
  }

  // Get one room

  async findRoomInfo(userId: string, id: string): Promise<PureRoomInfoDto> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id },
        relations: ['participants', 'participants.connectedUsers', 'messages'],
      });

      if (!room) {
        throw new WsException(`Room with ID "${id}" not found.`);
      }

      const isParticipant = room.participants.some(
        (participant) => participant.id === userId,
      );
      if (!isParticipant) {
        throw new WsException(
          `User with ID "${userId}" is not a participant of room with ID "${id}".`,
        );
      }

      return {
        ...room,
        participants: room.participants.map((participant) =>
          removeSensitiveDataUser(participant),
        ),
      };
    } catch (error) {
      this.logger.error(
        `Failed to find room with ID ${id} for user ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while retrieving the room.');
    }
  }

  // Get rooms by user id
  async findRoomsByUserId(userId: string): Promise<PureRoomInfoDto[]> {
    try {
      const rooms = await this.roomRepository
        .createQueryBuilder('room')
        .innerJoin(
          'room.participants',
          'participant',
          'participant.id = :userId',
          { userId },
        )
        .leftJoinAndSelect('room.participants', 'allParticipants')
        .getMany();

      const roomsList = [];

      for (const room of rooms) {
        // finding messages
        // default latest 10 messages
        const { result, total } = await this.messageService.findMessages({
          roomId: room.id,
        });

        const roomDetail = {
          ...room,
          latestMessages: total ? result : [],
          participants: room.participants.map((participant) =>
            removeSensitiveDataUser(participant),
          ),
        };

        roomsList.push(roomDetail);
      }

      return roomsList;
    } catch (error) {
      this.logger.error(
        `Failed to find rooms for user ID ${userId}: ${error.message}`,
        { userId, errorStack: error.stack },
      );
      throw new WsException(
        'An error occurred while getting user rooms. Please try again later.',
      );
    }
  }

  // User join to room or name change
  // Update room by user id
  async update(
    userId: string,
    roomId: string,
    updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    const { name, participants } = updateRoomDto;

    try {
      const room = await this.roomRepository.findOne({ where: { id: roomId } });

      if (name !== undefined) {
        room.name = name;
      }

      if (participants !== undefined) {
        participants.push(userId);
        await this.assignUsersToRoom(userId, {
          roomId,
          participants,
        });
      }

      room.updatedBy = userId;
      const updatedRoom = await this.roomRepository.save(room);

      this.logger.log(
        `Room with ID ${roomId} updated successfully by User ID: ${userId}`,
      );
      return updatedRoom;
    } catch (error) {
      this.logger.error(
        `Failed to update room with ID ${roomId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while updating the room.');
    }
  }

  // Delete room
  // Only created user can delete the room
  async deleteRoom(roomId: string, userId: string): Promise<void> {
    try {
      await this.checkIfCreatedByUser(roomId, userId);
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.delete(Message, { roomId: roomId });

        await transactionalEntityManager.delete(RoomParticipantUser, {
          roomId: roomId,
        });

        const deletionResult = await transactionalEntityManager.delete(Room, {
          id: roomId,
        });

        if (deletionResult.affected === 0) {
          this.logger.warn(`Room with ID ${roomId} not found.`);
          throw new WsException(`Room with ID "${roomId}" not found.`);
        }

        this.logger.log(
          `Room with ID ${roomId} and all associated data deleted successfully.`,
        );
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete room with ID ${roomId}: ${error.message}`,
        error.stack,
      );
      throw new WsException(
        'An error occurred while attempting to delete the room. Please try again.',
      );
    }
  }

  // Assign users to room
  private async assignUsersToRoom(
    userId: string,
    assignUsersDto: AssignUsersDto,
  ): Promise<void> {
    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        const existingParticipants = await transactionalEntityManager.find(
          RoomParticipantUser,
          {
            where: { roomId: assignUsersDto.roomId },
          },
        );
        const operationType =
          existingParticipants.length > 0 ? 're-assigned' : 'assigned';

        await transactionalEntityManager.delete(RoomParticipantUser, {
          roomId: assignUsersDto.roomId,
        });

        const participantsToAssign = assignUsersDto.participants.map(
          (participantId) => ({
            roomId: assignUsersDto.roomId,
            userId: participantId,
            createdBy: userId,
            updatedBy: userId,
          }),
        );

        await transactionalEntityManager.save(
          RoomParticipantUser,
          participantsToAssign,
        );

        this.logger.log(
          `Users ${operationType} to room ${assignUsersDto.roomId} successfully.`,
        );
      });
    } catch (error) {
      this.logger.error(
        `Failed to assign users to room: ${error.message}`,
        error.stack,
      );
      throw new WsException(
        `Failed to assign users to the room: ${error.message}`,
      );
    }
  }

  // Check if room is created by user
  private async checkIfCreatedByUser(roomId: string, userId: string) {
    try {
      const room = await this.roomRepository.findOne({
        where: {
          id: roomId,
        },
      });
      if (!room) {
        this.logger.error(`Failed! There is no room with ID - ${roomId}`);
        throw new NotFoundException(`Room with ID "${roomId}" not found.`);
      }

      if (room.createdBy !== userId) {
        this.logger.error(
          `Access denied. The room ID - ${roomId} was not created by user ID - ${userId}`,
        );
        throw new WsException(
          'Access Denied: The room was not created by given user',
        );
      }
      return;
    } catch (error) {
      this.logger.error(
        `Failed to check room user ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException(
        `An error occurred while checking room by user ID - ${userId}. Please try again.`,
      );
    }
  }
}

import { Logger, UnauthorizedException, UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import { UserPayload } from 'src/types/user-payload.type';

import { WsExceptionFilter } from 'src/utils/filters/ws-exception.filter';
import { ConnectedUserService } from './services/connected-user.service';
import { RoomService } from './services/room.service';
import { User } from '../user/entities';
import { RoomTypeEnum } from './enums/room-type.enum';
import { WsCurrentUser } from 'src/utils/decorators/ws-current-user.decorator';
import {
  CreateMessageDto,
  CreateRoomDto,
  DeleteMessageDto,
  FilterMessageDto,
  RoomIdDto,
} from './dtos';
import { MessageService } from './services/message.service';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { UpdateRoomDto } from './dtos/update-room.dto';

@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly connectedUserService: ConnectedUserService,
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
  ) {}

  afterInit() {
    this.logger.log(`ChatGateway initialized >>`);
  }

  async handleConnection(socket: Socket): Promise<void> {
    this.logger.log(`Handling connection, Socket ID - ${socket.id}`);
    try {
      const user = this.authenticateSocket(socket);
      await this.initializeUserConnection(user, socket);
      this.logger.log(
        `Connected! Socket ID -> ${socket.id}, User ID -> ${user.id}, User Email -> ${user.email}`,
      );
    } catch (error) {
      this.handleConnectionError(socket, error);
    }
  }

  async handleDisconnect(socket: Socket) {
    // clear connections in DB
    await this.connectedUserService.delete(socket.id);
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(socket: any, payload: any): string {
    return `Hello world! >> socket id - ${socket.id}, payload - ${JSON.stringify(payload)}`;
  }
  // Create room
  @SubscribeMessage('createRoom')
  async onCreateRoom(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody() body: any,
  ): Promise<void> {
    const createRoomDto = JSON.parse(body) as CreateRoomDto;
    try {
      this.validateRoomTypeAndParticipants(
        currentUser.id,
        createRoomDto.type,
        createRoomDto.participants,
      );

      const newRoom = await this.roomService.create(
        currentUser.id,
        createRoomDto,
      );

      const createdRoomWithDetails = await this.roomService.findRoomInfo(
        currentUser.id,
        newRoom.id,
      );

      await this.notifyRoomParticipants(
        createdRoomWithDetails.participants,
        'roomCreated',
        createdRoomWithDetails,
      );
      this.logger.log(
        `Room with ID ${newRoom.id} created and participants notified successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create room inside gateway: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while creating the room.');
    }
  }

  // Get room info
  @SubscribeMessage('fetchRoomDetails')
  async onFetchRoomDetails(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody() body: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const roomIdDto = JSON.parse(body) as RoomIdDto;
    const { id: userId } = currentUser;
    const { roomId } = roomIdDto;

    try {
      const room = await this.roomService.findRoomInfo(userId, roomId);

      await this.emitToSocket(socket.id, 'roomDetailsFetched', room);

      this.logger.log(
        `User ID ${userId} fetched details for Room ID ${room.id} successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching details for Room ID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while fetching room details.');
    }
  }

  // Update room
  @SubscribeMessage('updateRoom')
  async onUpdateRoom(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody() body: any,
  ): Promise<void> {
    console.log('Body>>', body);
    const updateRoomDto = JSON.parse(body) as UpdateRoomDto;
    try {
      const room = await this.roomService.findRoomInfo(
        currentUser.id,
        updateRoomDto.roomId,
      );

      this.validateRoomTypeAndParticipants(
        currentUser.id,
        room.type,
        updateRoomDto.participants,
      );

      await this.roomService.update(
        currentUser.id,
        updateRoomDto.roomId,
        updateRoomDto,
      );
      const updatedRoom = await this.roomService.findRoomInfo(
        currentUser.id,
        updateRoomDto.roomId,
      );

      await this.notifyRoomParticipants(
        updatedRoom.participants,
        'roomUpdated',
        updatedRoom,
      );
      this.logger.log(
        `Room with ID ${updateRoomDto.roomId} updated and participants notified successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `Error updating room with ID ${updateRoomDto.roomId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while updating room details.');
    }
  }

  // Delete room
  @SubscribeMessage('deleteRoom')
  async onDeleteRoom(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody() body: any,
  ): Promise<void> {
    const roomIdDto = JSON.parse(body) as RoomIdDto;
    const { id: userId } = currentUser;
    const { roomId } = roomIdDto;

    try {
      const roomToDelete = await this.roomService.findRoomInfo(userId, roomId);
      await this.roomService.deleteRoom(userId, roomId);

      await this.notifyRoomParticipants(
        roomToDelete.participants.filter(
          (participant) => participant.id !== userId,
        ),
        'roomDeleted',
        { message: `Room with ID ${roomId} has been successfully deleted.` },
      );

      this.logger.log(
        `Room with ID ${roomId} deleted successfully by user ID ${userId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting room with ID ${roomId} by user ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while deleting the room.');
    }
  }

  // Send message
  @SubscribeMessage('sendMessage')
  async onSendMessage(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody() body: any,
  ): Promise<void> {
    const createMessageDto = JSON.parse(body) as CreateMessageDto;
    const userId = currentUser.id;
    const { roomId } = createMessageDto;

    try {
      const newMessage = await this.messageService.create(
        userId,
        createMessageDto,
      );
      this.logger.log(
        `User ID ${userId} sent a new message in Room ID ${roomId}`,
      );

      const room = await this.roomService.findRoomInfo(userId, roomId);
      await this.notifyRoomParticipants(
        room.participants,
        'messageSent',
        newMessage,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send message in Room ID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while sending the message.');
    }
  }

  // Get all messages inside room
  @SubscribeMessage('getAllMessages')
  async onGetAllMessages(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody() body: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const filterMessageDto = JSON.parse(body) as FilterMessageDto;
    const { id: userId } = currentUser;
    const { roomId } = filterMessageDto;

    try {
      const room = await this.roomService.findRoomInfo(userId, roomId);

      const isParticipant = room.participants.some(
        (participant) => participant.id === userId,
      );
      if (!isParticipant) {
        throw new WsException(
          'Access Denied: You must be a member of the room to view messages.',
        );
      }

      const messages = await this.messageService.findMessages(filterMessageDto);
      this.server.to(socket.id).emit('allMessages', messages);
    } catch (error) {
      this.logger.error(
        `Failed to fetch messages for Room ID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while fetching messages.');
    }
  }

  // Update message
  @SubscribeMessage('updateMessage')
  async onUpdateMessage(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody() body: any,
  ): Promise<void> {
    const updateMessageDto = JSON.parse(body) as UpdateMessageDto;

    const userId = currentUser.id;

    try {
      const updatedMessage = await this.messageService.update(
        userId,
        updateMessageDto,
      );

      const updatedConversation = await this.messageService.findMessages({
        roomId: updatedMessage.roomId,
      });

      const room = await this.roomService.findRoomInfo(
        userId,
        updatedMessage.roomId,
      );
      await this.notifyRoomParticipants(
        room.participants,
        'messageUpdated',
        updatedConversation,
      );

      this.logger.log(
        `Message ID ${updateMessageDto.messageId} updated successfully by User ID ${userId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update message ID ${updateMessageDto.messageId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while updating the message.');
    }
  }

  // Delete messsage
  @SubscribeMessage('deleteMessage')
  async onDeleteMessage(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody() body: any,
  ): Promise<void> {
    const deleteMessageDto = JSON.parse(body) as DeleteMessageDto;
    const userId = currentUser.id;
    const { roomId, messageIds } = deleteMessageDto;

    try {
      const room = await this.roomService.findRoomInfo(userId, roomId);

      await this.messageService.delete(userId, deleteMessageDto);

      await this.notifyRoomParticipants(room.participants, 'messageDeleted', {
        messageIds,
      });

      this.logger.log(
        `Messages deleted successfully in Room ID ${roomId} by User ID ${userId}. Notifications sent to all participants.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete messages in Room ID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      );
      throw new WsException('Error occurred while deleting messages.');
    }
  }

  // PRIVATE METHODS

  // validateRoomType
  private validateRoomTypeAndParticipants(
    uid: string,
    rType?: string,
    p?: string[],
  ): void {
    const userId = uid;
    const roomType = rType || RoomTypeEnum.GROUP;
    const participants = (p && Array.isArray(p) && p.length && p) || [];
    console.log('Data>>>', {
      roomType,
      participants,
      userId,
    });

    if (participants && participants.includes(userId)) {
      throw new WsException(
        'The room owner or updater should not be included in the participants list.',
      );
    }

    if (roomType === RoomTypeEnum.DIRECT && participants.length !== 1) {
      throw new WsException(
        'Direct chat must include exactly one participant aside from the room owner or updater.',
      );
    }

    if (roomType === RoomTypeEnum.GROUP && participants.length < 1) {
      throw new WsException(
        'Group chat must include at least one participant aside from the room owner or updater.',
      );
    }

    const uniqueParticipantIds = new Set(participants);
    if (uniqueParticipantIds.size !== participants.length) {
      throw new WsException('The participants list contains duplicates.');
    }
  }

  // Notify to all participant sockets
  private async notifyRoomParticipants(
    participants: Partial<User>[],
    event: string,
    payload: any,
  ): Promise<void> {
    const connectedUsers = [];
    for (const p of participants) {
      const { result, total } = await this.connectedUserService.getByUserId(
        p.id,
      );
      if (total > 0) connectedUsers.push(...result);
    }

    const uniqueSockets = Array.from(
      new Set(connectedUsers.map((connectedUser) => connectedUser.socketId)),
    );
    const notificationPromises = uniqueSockets.map((socketId) => ({
      socketId,
      promise: this.emitToSocket(socketId, event, payload),
    }));
    const results = await Promise.allSettled(
      notificationPromises.map((np) => np.promise),
    );

    results.forEach((result, index) => {
      const { socketId } = notificationPromises[index];
      if (result.status === 'fulfilled') {
        this.logger.log(
          `Notification sent successfully to Socket ID -> ${socketId} for event '${event}'`,
        );
      } else if (result.status === 'rejected') {
        this.logger.error(
          `Failed to notify Socket ID ${socketId} for event '${event}': ${result.reason}`,
        );
      }
    });
  }

  // authenticate jwt
  private authenticateSocket(socket: Socket): UserPayload {
    const token = this.extractJwtToken(socket);
    return this.jwtService.verify<UserPayload>(token, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  // extra jwt
  private extractJwtToken(socket: Socket): string {
    const authHeader = socket.handshake.headers.authorization;
    if (!authHeader)
      throw new UnauthorizedException('No authorization header found');

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw new UnauthorizedException('Invalid or missing token');

    return token;
  }

  // initialize user connection
  private async initializeUserConnection(
    userPayload: UserPayload,
    socket: Socket,
  ): Promise<void> {
    socket.data.user = userPayload;

    // initializing logic

    // add incoming socket and user to connected user database
    await this.connectedUserService.create(userPayload.id, socket.id);

    // search rooms by user id currently connected
    const rooms = await this.roomService.findRoomsByUserId(userPayload.id);

    this.server.to(socket.id).emit('userRooms', rooms);
    this.logger.log(
      `Client connected: ${socket.id} - User ID: ${userPayload.id}`,
    );
  }

  private async emitToSocket(
    socketId: string,
    event: string,
    payload: any,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.to(socketId).emit(event, payload, (response: any) => {
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  // connection error handler
  private handleConnectionError(socket: Socket, error: Error): void {
    this.logger.error(
      `Connection error for socket ${socket.id}: ${error.message}`,
    );
    socket.emit('exception', 'Authentication error');
    socket.disconnect();
  }
}

import { Logger, UnauthorizedException, UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import { UserPayload } from 'src/types/user-payload.type';

import { WsExceptionFilter } from 'src/utils/filters/ws-exception.filter';

@UseFilters(WsExceptionFilter)
@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('ChatGateway');

  constructor(private readonly jwtService: JwtService) {}

  @SubscribeMessage('message')
  handleMessage(socket: any, payload: any): string {
    return `Hello world! >> socket id - ${socket.id}, payload - ${JSON.stringify(payload)}`;
  }

  afterInit() {
    this.logger.log(`ChatGateway initialized >>`);
  }

  async handleConnection(socket: Socket): Promise<void> {
    this.logger.log(`Handling connection, Socket ID - ${socket.id}`);
    try {
      const user = this.authenticateSocket(socket);
      await this.initializeUserConnection(user, socket);
    } catch (error) {
      this.handleConnectionError(socket, error);
    }
    // this.logger.log(`Connected - ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    // clear connections in DB

    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  // PRIVATE METHODS

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
    // create user in connected user table
    // find where use exist (rooms)
    this.logger.log(
      `Client connected: ${socket.id} - User ID: ${userPayload.id}`,
    );
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

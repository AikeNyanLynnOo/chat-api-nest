import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ChatGateway } from './chat.gateway';
import { MessageService } from './services/message.service';
import { ConnectedUserService } from './services/connected-user.service';
import { RoomService } from './services/room.service';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectedUser, Message, Room, RoomParticipantUser } from './entities';
import { ChatConroller } from './chat.controller';

@Module({
  providers: [
    ChatGateway,
    MessageService,
    ConnectedUserService,
    RoomService,
    JwtService,
  ],
  controllers: [ChatConroller],
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      Room,
      ConnectedUser,
      Message,
      RoomParticipantUser,
    ]),
  ],
})
export class ChatModule {}

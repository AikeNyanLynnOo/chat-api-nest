import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [ChatGateway],
  imports: [UserModule],
})
export class ChatModule {}

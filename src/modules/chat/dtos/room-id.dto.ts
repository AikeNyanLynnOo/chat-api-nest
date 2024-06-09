import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RoomIdDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

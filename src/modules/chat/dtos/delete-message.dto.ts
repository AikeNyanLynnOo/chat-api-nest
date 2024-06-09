import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class DeleteMessageDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ required: true, isArray: true })
  @IsArray()
  @IsUUID(4, { each: true, message: 'Each message id must be a valid UUID' }) // UUID version used here is 4
  @IsNotEmpty()
  messageIds: string[];
}

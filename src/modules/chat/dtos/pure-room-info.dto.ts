import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PureUserDto } from 'src/modules/user/dtos';
import { MessageDto } from './message.dto';

export class PureRoomInfoDto {
  @ApiProperty({ required: true, example: 'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsArray()
  participants: PureUserDto[];

  @ApiProperty()
  @IsArray()
  messages: MessageDto[];

  @ApiProperty({ example: 'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' })
  createdBy: string;

  @ApiProperty({ example: 'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' })
  updatedBy: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-02T00:00:00.000Z' })
  updatedAt: Date;
}

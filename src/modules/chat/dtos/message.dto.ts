import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PureUserDto } from 'src/modules/user/dtos';

export class MessageDto {
  @ApiProperty({ required: true, example: 'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: true, example: 'Hello' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ required: true, example: 'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ type: PureUserDto })
  user: PureUserDto;

  @ApiProperty({ example: 'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' })
  createdBy: string;

  @ApiProperty({ example: 'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' })
  updatedBy: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-02T00:00:00.000Z' })
  updatedAt: Date;
}

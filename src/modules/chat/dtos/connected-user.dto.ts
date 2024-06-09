import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { PureUserDto } from 'src/modules/user/dtos';
export class ConnectedUserDto {
  @ApiProperty({ example: 'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: true, example: 'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'ojIckSD2jqNzOqIrAGzL' })
  @IsString()
  @IsNotEmpty()
  socketId: string;

  @ApiProperty({ type: PureUserDto })
  user: PureUserDto;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-02T00:00:00.000Z' })
  updatedAt: Date;
}

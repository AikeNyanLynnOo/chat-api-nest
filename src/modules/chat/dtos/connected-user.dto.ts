import { ApiProperty } from '@nestjs/swagger';
import { PureUserDto } from 'src/modules/user/dtos';
export class ConnectedUserDto {
  @ApiProperty({ example: 'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' })
  id: string;

  @ApiProperty({ example: 'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' })
  userId: string;

  @ApiProperty({ example: 'ojIckSD2jqNzOqIrAGzL' })
  socketId: string;

  @ApiProperty({ type: PureUserDto })
  user: PureUserDto;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-02T00:00:00.000Z' })
  updatedAt: Date;
}

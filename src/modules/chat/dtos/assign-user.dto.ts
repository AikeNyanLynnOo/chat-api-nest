import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignUsersDto {
  @ApiProperty({ example: 'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    example: [
      'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
      'XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID(4, { each: true, message: 'Each participant must be a valid UUID' })
  @IsNotEmpty()
  participants: string[];
}

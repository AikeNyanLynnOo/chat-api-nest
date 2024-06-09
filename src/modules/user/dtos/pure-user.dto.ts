import { ApiProperty } from '@nestjs/swagger';

export class PureUserDto {
  @ApiProperty({
    description: 'The unique uuid of the user',
    example: '123e4567-e89b-12d3-a456-426655440000',
  })
  id: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'name@domain.com',
  })
  email: string;
}
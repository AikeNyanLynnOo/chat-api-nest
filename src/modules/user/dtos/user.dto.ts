import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
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

  @ApiProperty({
    description: 'The hashed password of the user',
  })
  hashedPassword: string;

  @ApiProperty({
    description: 'The refresh token of the user',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'The created timestamp of user',
  })
  createdAt: string;

  @ApiProperty({
    description: 'The updated timestamp of user',
  })
  updatedAt: string;
}

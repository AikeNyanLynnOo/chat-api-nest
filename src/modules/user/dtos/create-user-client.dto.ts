import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import {
  ContainsLowercase,
  ContainsSpecialCharacter,
  ContainsUppercase,
} from 'src/utils/decorators/password-validation.decorator';

export class CreateUserClientDto {
  @ApiProperty({
    required: true,
    description: 'The first name of the user',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    required: true,
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    required: true,
    description: 'The email address of the user',
    example: 'name@domain.com',
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    required: true,
    description: 'The password of the user',
    example: '12345678',
  })
  @IsNotEmpty()
  @IsString()
  // @Matches(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  //   {
  //     message:
  //       'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
  //   },
  // )
  @Length(8, 128, {
    message: 'Password must be at least 8 characters long.',
  })
  @Matches(/^[A-Za-z\d@$!%*?&]+$/, {
    message:
      'Password must contain only alphanumeric characters and special characters.',
  })
  @ContainsUppercase({
    message: 'Password must contain at least one uppercase letter.',
  })
  @ContainsLowercase({
    message: 'Password must contain at least one lowercase letter.',
  })
  @ContainsSpecialCharacter({
    message: 'Password must contain at least one special character.',
  })
  password: string;
}

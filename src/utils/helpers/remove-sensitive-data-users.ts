/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserDto } from 'src/modules/user/dtos';
import { PureUserDto } from 'src/modules/user/dtos/pure-user.dto';
import { User } from 'src/modules/user/entities';

export const removeSensitiveDataUser = (user: User): PureUserDto => {
  const { hashedPassword, refreshToken, ...pureUser } = user;
  return pureUser;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserDto } from 'src/modules/user/dtos';
import { User } from 'src/modules/user/entities';

export const removeSensitiveDataUser = (user: User): Partial<User> => {
  const { hashedPassword, refreshToken, ...pureUser } = user;
  return pureUser;
};

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../../types/user-payload.type';

export const CurrentUser = createParamDecorator(
  (data: string, context: ExecutionContext): UserPayload => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

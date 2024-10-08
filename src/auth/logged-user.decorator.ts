import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import User from '../user/user.model';

export const LoggedUser = createParamDecorator(
  (_data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    //console.log('Request currentUser:', request.currentUser); // Log request.currentUser
    return request.currentUser || null ; // Trả về thông tin user từ request
  },
);

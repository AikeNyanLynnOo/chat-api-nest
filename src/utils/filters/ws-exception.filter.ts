import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const data = host.switchToWs().getData();

    const errorResponse = {
      status: 'error',
      message: exception.message,
      data,
    };

    client.emit('exception', errorResponse);
  }
}

import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { ERROR_EVENT, ErrorEventDto } from './error-event.dto';
import { SocketErrorDto } from './socket-error.dto';

type Exception = WsException | HttpException | Error;

@Catch()
export class SocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: Exception, host: ArgumentsHost): void {
    const getErrorData = (exception: Exception): string | object => {
      if (exception instanceof WsException) {
        return exception.getError();
      }
      if (exception instanceof HttpException) {
        return exception.getResponse();
      }
      return exception.message;
    };

    const getErrorStatus = (exception: Exception): number => {
      if (exception instanceof HttpException) {
        return exception.getStatus();
      }
      return 500;
    };

    const client = host.switchToWs().getClient<Socket>();
    const errorData = getErrorData(exception);
    const errorStatus = getErrorStatus(exception);
    const error: ErrorEventDto = {
      eventId: uuid(),
      relatedEventId:
        errorData instanceof SocketErrorDto
          ? errorData.relatedEventId
          : undefined,
      status: errorStatus,
      message: exception.message,
    };
    client.emit(ERROR_EVENT, error);
  }
}

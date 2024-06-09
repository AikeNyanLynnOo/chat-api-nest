import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConnectedUserService {
  private readonly logger = new Logger(ConnectedUserService.name);
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  getHelloMessage(): { message: string } {
    return { message: 'Hello World' };
  }
}

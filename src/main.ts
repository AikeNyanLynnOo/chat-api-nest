import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';

// Document
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// server config
import { SERVER_CONFIG } from './configs/sever.config';
import { ValidationPipe } from '@nestjs/common';

// config for env
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // cors enable for all
  app.enableCors({ credentials: true, origin: '*' });
  // parse cookies
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Chat App built with NestJS and Socket.io')
    .setDescription('Realtime, one to one, rooms chatting api backend')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(SERVER_CONFIG.PORT);
}
bootstrap();

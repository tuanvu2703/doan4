import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cors from 'cors'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cookie } from 'request';
import * as cookieParser from 'cookie-parser';
// import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';



declare const module: any

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  // app.use(helmet());
  app.enableCors({
    origin: ['http://localhost:3000', 'https://nemo-mocha.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });


  const config = new DocumentBuilder()
    .setTitle('Function API social network')
    .setDescription(' NestJS Function Documentation')
    .setVersion('1.0')
    .addTag('THIS API IS FOR SOCIAL NETWORK')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('socialnetowrk', app, document);


  await app.listen(3001);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

}
bootstrap();

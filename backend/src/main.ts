import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cors from 'cors'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
declare const module: any

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //   }),
  // );

  app.enableCors({
    origin: ['http://localhost:3000','https://zafacook.netlify.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  })

  const config = new DocumentBuilder()
    .setTitle('NestJS Example')
    .setDescription('NestJS Example API description')
    .setVersion('1.0')
    .addTag('nestjs-example')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

}
bootstrap();

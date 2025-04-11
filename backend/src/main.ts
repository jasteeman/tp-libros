import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { swaggerUi } from 'swagger-ui-express';

async function bootstrap() { 
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: "*",
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    },
  });
  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT') ?? 3000;

  const config = new DocumentBuilder()
  .setTitle('CMPC-Libros API')
  .setDescription('API para la gestión de libros de CMPC-Libros')
  .setVersion('1.0')
  .addTag('libros')
  .addTag('usuarios')
  .addTag('auth')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  console.log(`La aplicación se está ejecutando en el puerto: ${port}`);
}
bootstrap();
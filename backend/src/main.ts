import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() { 
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost:4200'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    },
  });
  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT') ?? 3000;
  await app.listen(port);
  console.log(`La aplicación se está ejecutando en el puerto: ${port}`);
}
bootstrap();
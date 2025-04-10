import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LibrosModule } from './libros/libros.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Libro } from './libros/entities/libro.entity';
import { Usuario } from './usuarios/entities/usuario.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        models: [Libro, Usuario],
        autoLoadModels: true,
        synchronize: true,
        logging:true
      }),
    }),
    UsuariosModule,
    AuthModule,
    LibrosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { libroProviders } from './libros.providers';
import { LibrosController } from './controllers/libros.controller';
import { LibrosService } from './services/libro.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Libro } from './entities/libro.entity';

@Module({
    imports: [SequelizeModule.forFeature([Libro])],
    controllers: [LibrosController],
    providers: [LibrosService, ...libroProviders],
})
export class LibrosModule { }
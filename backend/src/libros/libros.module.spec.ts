import { Test, TestingModule } from '@nestjs/testing';
import { LibrosModule } from './libros.module';
import { LibrosController } from './controllers/libros.controller';
import { LibrosService } from './services/libro.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Libro } from './entities/libro.entity';

describe('LibrosModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          dialect: 'sqlite', 
          storage: ':memory:',
          models: [Libro],
          autoLoadModels: true,
          synchronize: true,
        }),
        SequelizeModule.forFeature([Libro]),
        LibrosModule,
      ],
    }).compile();
  },30000);

  it('debería estar definido el módulo', () => {
    expect(module).toBeDefined();
  });

  it('debería estar definido el controlador LibrosController', () => {
    const controller = module.get<LibrosController>(LibrosController);
    expect(controller).toBeDefined();
  });

  it('debería estar definido el servicio LibrosService', () => {
    const service = module.get<LibrosService>(LibrosService);
    expect(service).toBeDefined();
  });

  it('debería estar definido el modelo Libro', () => {
    const libroModel = module.get('Libro');
    expect(libroModel).toBeDefined();
  });

  it('debería importar el modelo Libro en SequelizeModule', () => {
    const sequelize = module.get(SequelizeModule);
    expect(sequelize).toBeDefined();
  });

});
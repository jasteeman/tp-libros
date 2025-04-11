import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosModule } from './usuarios.module';
import { UsuariosService } from './services/usuarios.service';
import { UsuariosController } from './controllers/usuarios.controller';
import { usuarioProviders } from './usuarios.providers';
import { SequelizeModule } from '@nestjs/sequelize';
import { Usuario } from './entities/usuario.entity';

describe('UsuariosModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                UsuariosModule,
                SequelizeModule.forRoot({
                    dialect: 'sqlite',
                    storage: ':memory:',
                    autoLoadModels: true,
                    synchronize: false,
                }),
                SequelizeModule.forFeature([Usuario]),
            ],
        }).compile();
    }, 30000);

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    it('should provide UsuariosService', () => {
        const service = module.get<UsuariosService>(UsuariosService);
        expect(service).toBeDefined();
    });

    it('should provide UsuariosController', () => {
        const controller = module.get<UsuariosController>(UsuariosController);
        expect(controller).toBeDefined();
    });

    it('should provide usuarioProviders', () => {
        usuarioProviders.forEach((provider) => {
            const provided = module.get(provider.provide);
            expect(provided).toBeDefined();
        });
    });

    it('should export UsuariosService', () => {
        const exportedService = module.get<UsuariosService>(UsuariosService);
        expect(exportedService).toBeDefined();
    });
});
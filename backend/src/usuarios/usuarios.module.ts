import { Module } from '@nestjs/common'; 
import { SequelizeModule } from '@nestjs/sequelize';
import { Usuario } from './entities/usuario.entity';
import { UsuariosController } from './controllers/usuarios.controller';
import { UsuariosService } from './services/usuarios.service';
import { usuarioProviders } from './usuarios.providers';

@Module({
  imports: [SequelizeModule.forFeature([Usuario])],
  controllers: [UsuariosController],
  providers: [UsuariosService, ...usuarioProviders],
  exports:[UsuariosService]
})
export class UsuariosModule {}
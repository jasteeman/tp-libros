import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../entities/usuario.entity';
import { CreateUsuarioDto, UpdateUsuarioDto } from '../dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario)
    private readonly usuarioModel: typeof Usuario,
  ) {}

  async create(createUserDto: CreateUsuarioDto): Promise<Usuario> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.usuarioModel.create({ ...createUserDto, password: hashedPassword } as any);
    return newUser.dataValues as Usuario;
  }

  async findAll(): Promise<{ rows: Usuario[]; count: number; }> {
    const users = await this.usuarioModel.findAndCountAll();
    return users;
  }

  async findOne(id: number): Promise<Usuario | null> {
    const user = await this.usuarioModel.findByPk(id);
    return user ? user.dataValues as Usuario : null;
  }

  async findOneByUsername(username: string): Promise<Usuario | null> {
    const user = await this.usuarioModel.findOne({ where: { username } });
    return user ? user.dataValues as Usuario : null;
  }

  async findOneByEmail(email: string): Promise<Usuario | null> {
    const user = await this.usuarioModel.findOne({ where: { email } });
    return user ? user.dataValues as Usuario : null;
  }

  async update(id: number, updateUserDto: UpdateUsuarioDto): Promise<[number, Usuario[]]> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const [affectedCount, updatedUsers] = await this.usuarioModel.update(updateUserDto, {
      where: { id },
      returning: true,
    });
    return [affectedCount, updatedUsers.map(user => user.dataValues as Usuario)];
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    if (user) {
      await user.destroy();
    }
  }
}
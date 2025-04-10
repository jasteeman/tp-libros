import { Controller, Post, Body, Patch, Param, Delete, Get, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { UsuariosService } from '../services/usuarios.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from '../dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUsuarioDto) {
    return this.usuariosService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usuariosService.remove(+id);
    return { message: `Usuario con ID ${id} eliminado` };
  }
}
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Res } from '@nestjs/common';  
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger'; 
import { LibrosService } from '../services/libro.service';
import { CreateLibroDto, UpdateLibroDto } from '../dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Response } from 'express';

@ApiTags('libros')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('libros')
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  @Post()
  async create(@Body() createLibroDto: CreateLibroDto) {
    return await this.librosService.create(createLibroDto);
  }

  @Get()
  @ApiQuery({ name: 'genero', required: false })
  @ApiQuery({ name: 'editorial', required: false })
  @ApiQuery({ name: 'autor', required: false })
  @ApiQuery({ name: 'disponibilidad', required: false, type: 'boolean' })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('genero') genero?: string,
    @Query('editorial') editorial?: string,
    @Query('autor') autor?: string,
    @Query('disponibilidad') disponibilidad?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    return await this.librosService.findAll(
      parseInt(page, 10),
      parseInt(limit, 10),
      sortOrder, 
      genero,
      editorial,
      autor,
      disponibilidad === 'true',
      sortBy,
      search,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.librosService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLibroDto: UpdateLibroDto) {
    return await this.librosService.update(+id, updateLibroDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.librosService.remove(+id);
    return { message: `Libro con ID ${id} eliminado` };
  }

  @Get('export/excel')
  async exportToExcel(@Res({ passthrough: true }) res: Response) {
    return this.librosService.exportToExcel(res);
  }
}
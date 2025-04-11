import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Crear un nuevo libro' })
  @ApiResponse({ status: 201, description: 'Libro creado con éxito' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  @ApiBody({ type: CreateLibroDto })
  async create(@Body() createLibroDto: CreateLibroDto) {
    return await this.librosService.create(createLibroDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de libros (con filtros y paginación)' })
  @ApiResponse({ status: 200, description: 'Lista de libros obtenida con éxito' })
  @ApiQuery({ name: 'search', required: false, description: 'Término de búsqueda' })
  @ApiQuery({ name: 'disponibilidad', required: false, type: 'boolean', description: 'Filtrar por disponibilidad' })
  @ApiQuery({ name: 'sortField', required: false, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Orden de ordenamiento (ASC o DESC)' })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Cantidad de libros por página' })
  async findAll(
    @Query('search') search?: string,
    @Query('disponibilidad') disponibilidad?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return await this.librosService.findAll(
      parseInt(page, 10),
      parseInt(limit, 10),
      sortOrder,
      disponibilidad !== undefined ? disponibilidad === 'true' : undefined,
      sortField?.trim() || undefined,
      search?.trim() || undefined
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un libro por ID' })
  @ApiResponse({ status: 200, description: 'Libro obtenido con éxito' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del libro' })
  async findOne(@Param('id') id: string) {
    return await this.librosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un libro por ID' })
  @ApiResponse({ status: 200, description: 'Libro actualizado con éxito' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  @ApiBody({ type: UpdateLibroDto })
  @ApiParam({ name: 'id', description: 'ID del libro' })
  async update(@Param('id') id: string, @Body() updateLibroDto: UpdateLibroDto) {
    return await this.librosService.update(+id, updateLibroDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un libro por ID' })
  @ApiResponse({ status: 200, description: 'Libro eliminado con éxito' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del libro' })
  async remove(@Param('id') id: string) {
    await this.librosService.remove(+id);
    return { message: `Libro con ID ${id} eliminado` };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar libros a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado con éxito' })
  async exportToExcel(@Res({ passthrough: true }) res: Response) {
    return this.librosService.exportToExcel(res);
  }
}
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
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'disponibilidad', required: false, type: 'boolean' })
  @ApiQuery({ name: 'sortField', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
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
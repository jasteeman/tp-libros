import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { Op} from 'sequelize';
import { Libro } from '../entities/libro.entity';
import { CreateLibroDto, UpdateLibroDto } from '../dto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class LibrosService {
  private readonly logger = new Logger(LibrosService.name);

  constructor(
    @Inject('Libro')
    private readonly libroModel: typeof Libro,
  ) {}

  async create(createLibroDto: CreateLibroDto): Promise<Libro> {
    try {
      const newLibro = await this.libroModel.create(createLibroDto as any);
      return newLibro;
    } catch (error) {
      this.logger.error(`Error al crear libro: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(
    page: number,
    limit: number,
    sortOrder: 'ASC' | 'DESC' = 'ASC', 
    disponibilidad?: boolean,
    sortField?: string, 
    search?: string,
  ): Promise<{ rows: Libro[]; count: number }> {
    try {
      const where: any = {}; 
      if (disponibilidad !== undefined) where.disponibilidad = disponibilidad;
      if (search) {
        where[Op.or] = [
          { titulo: { [Op.iLike]: `%${search}%` } },
          { autor: { [Op.iLike]: `%${search}%` } },
          { editorial: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const order: [string, 'ASC' | 'DESC'][] = sortField ? [[sortField, sortOrder]] : [];
      const offset = (page) * limit;

      const result = await this.libroModel.findAndCountAll({
        where,
        order,
        limit,
        offset,
        paranoid: true, // Incluye solo los no eliminados (soft delete)
      });
      this.logger.warn(`Libros filtrados: ${result.count}.`);
      return result;
    } catch (error) {
      this.logger.error(`Error al obtener el listado de libros: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<Libro|null> {
    try {
      const libro = await this.libroModel.findByPk(id, { paranoid: true });
      if (!libro) {
        this.logger.warn(`Libro con ID ${id} no encontrado.`);
        throw new NotFoundException(`Libro con ID ${id} no encontrado`);
      }
       return libro;
    } catch (error) {
      this.logger.error(`Error al buscar el libro con ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: number, updateLibroDto: UpdateLibroDto): Promise<[number, Libro[]]> {
    try {
      this.logger.log(`Actualizando libro con ID ${id}. Datos a actualizar: ${JSON.stringify(updateLibroDto)}`);
      const [affectedCount, updatedLibros] = await this.libroModel.update(updateLibroDto, {
        where: { id },
        paranoid: true,
        returning: true,
      });
      if (affectedCount > 0) {
        this.logger.log(`Libro con ID ${id} actualizado. Filas afectadas: ${affectedCount}`);
      } else {
        this.logger.warn(`No se encontró el libro con ID ${id} para actualizar.`);
        throw new NotFoundException(`No se encontró el libro con ID ${id} para actualizar`);
      }
      return [affectedCount, updatedLibros];
    } catch (error) {
      this.logger.error(`Error al actualizar el libro con ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
       const libro = await this.findOne(id); // Verificar si existe antes de eliminar
      if (libro) {
        await this.libroModel.destroy({ where: { id } });
       } else {
        this.logger.warn(`No se encontró el libro con ID ${id} para eliminar.`);
        throw new NotFoundException(`No se encontró el libro con ID ${id} para eliminar`);
      }
    } catch (error) {
      this.logger.error(`Error al eliminar el libro con ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async exportToExcel(res: Response): Promise<void> {
    try {
       const librosData = await this.libroModel.findAndCountAll()

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Libros');

      worksheet.columns = [
        { header: 'Título', key: 'titulo', width: 30 },
        { header: 'Autor', key: 'autor', width: 20 },
        { header: 'Editorial', key: 'editorial', width: 20 },
        { header: 'Precio', key: 'precio', width: 10 },
        { header: 'Disponibilidad', key: 'disponibilidad', width: 15 },
        { header: 'Género', key: 'genero', width: 15 },
      ];

      librosData.rows.forEach((libro) => {
        worksheet.addRow(libro);
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=libros.xlsx');

      await workbook.xlsx.write(res);
    } catch (error) {
      this.logger.error(`Error al exportar a Excel: ${error.message}`, error.stack);
      throw error;
    }
  }
}
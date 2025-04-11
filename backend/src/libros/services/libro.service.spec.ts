import { Test, TestingModule } from "@nestjs/testing";
import { LibrosService } from "./libro.service";
import { NotFoundException } from "@nestjs/common";
import { Op } from "sequelize";
import * as ExcelJS from 'exceljs';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Libro } from "../entities/libro.entity";
import { Response } from "express";

describe('LibrosService', () => {
    let service: LibrosService;

    const mockLibroModel = {
        create: jest.fn(),
        findAndCountAll: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
    };


    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LibrosService,
                {
                    provide: 'Libro',
                    useValue: mockLibroModel,
                },
            ],
        }).compile();

        service = module.get<LibrosService>(LibrosService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('create', () => {
        it('debería crear un libro', async () => {
            const dto = { titulo: 'Libro A', autor: 'Autor A' };
            const created = { id: 1, ...dto };

            mockLibroModel.create.mockResolvedValue(created);

            const result = await service.create(dto as any);
            expect(result).toEqual(created);
            expect(mockLibroModel.create).toHaveBeenCalledWith(dto);
        });
        it('debería manejar errores al crear un libro', async () => {
            const dto = { titulo: 'Libro A', autor: 'Autor A' };
            const error = new Error('Error de creación');

            mockLibroModel.create.mockRejectedValue(error);

            await expect(service.create(dto as any)).rejects.toThrow(error);
            expect(mockLibroModel.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('debería devolver una lista de libros con paginación y filtros', async () => {
            const libros = [{ id: 1, titulo: 'Libro A' }, { id: 2, titulo: 'Libro B' }];
            const count = 2;
            mockLibroModel.findAndCountAll.mockResolvedValue({ rows: libros, count });

            const result = await service.findAll(1, 10, 'ASC', true, 'titulo', 'Libro');

            expect(result).toEqual({ rows: libros, count });
            expect(mockLibroModel.findAndCountAll).toHaveBeenCalledWith({
                where: {
                    disponibilidad: true,
                    [Op.or]: [
                        { titulo: { [Op.iLike]: '%Libro%' } },
                        { autor: { [Op.iLike]: '%Libro%' } },
                        { editorial: { [Op.iLike]: '%Libro%' } },
                    ],
                },
                order: [['titulo', 'ASC']],
                limit: 10,
                offset: 10,
                paranoid: true,
            });
        });

        it('debería manejar errores al obtener la lista de libros', async () => {
            const error = new Error('Error al obtener libros');
            mockLibroModel.findAndCountAll.mockRejectedValue(error);

            await expect(service.findAll(1, 10)).rejects.toThrow(error);
        });

        it('debería devolver una lista de libros sin filtros cuando estos no se proporcionan', async () => {
            const libros = [{ id: 1, titulo: 'Libro A' }, { id: 2, titulo: 'Libro B' }];
            const count = 2;
            mockLibroModel.findAndCountAll.mockResolvedValue({ rows: libros, count });

            const result = await service.findAll(1, 10);

            expect(result).toEqual({ rows: libros, count });
            expect(mockLibroModel.findAndCountAll).toHaveBeenCalledWith({
                where: {},
                order: [],
                limit: 10,
                offset: 10,
                paranoid: true,
            });
        });
    });

    describe('findOne', () => {
        it('debería devolver un libro por ID', async () => {
            const libro = { id: 1, titulo: 'Libro A' };
            mockLibroModel.findByPk.mockResolvedValue(libro);

            const result = await service.findOne(1);
            expect(result).toEqual(libro);
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            mockLibroModel.findByPk.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('debería actualizar un libro', async () => {
            const dto = { titulo: 'Nuevo Título' };
            const updated = [{ id: 1, ...dto }];
            mockLibroModel.update.mockResolvedValue([1, updated]);

            const result = await service.update(1, dto as any);
            expect(result).toEqual([1, updated]);
        });

        it('debería lanzar NotFoundException si no se actualiza nada', async () => {
            mockLibroModel.update.mockResolvedValue([0, []]);

            await expect(service.update(1, {} as any)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('debería eliminar un libro', async () => {
            const libro = { id: 1 };
            mockLibroModel.findByPk.mockResolvedValue(libro);
            mockLibroModel.destroy.mockResolvedValue(1);

            await service.remove(1);
            expect(mockLibroModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('debería lanzar NotFoundException si no se encuentra', async () => {
            mockLibroModel.findByPk.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        });

        it('debería manejar errores al eliminar un libro', async () => {
            const error = new Error('Error al eliminar');
            mockLibroModel.findByPk.mockResolvedValue({ id: 1 });
            mockLibroModel.destroy.mockRejectedValue(error);

            await expect(service.remove(1)).rejects.toThrow(error);
        });

        it('debería lanzar NotFoundException si no se encuentra', async () => {
            mockLibroModel.findByPk.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('exportToExcel', () => {
        it('debería exportar libros a Excel', async () => {
          const mockRes = {
            setHeader: jest.fn(),
            end: jest.fn(),
          } as unknown as Response;
    
          const mockWorkbook = {
            addWorksheet: jest.fn().mockReturnThis(),
            xlsx: {
              write: jest.fn().mockResolvedValue(undefined),
            },
          } as any;
    
          const mockAddRow = jest.fn();
          mockWorkbook.addWorksheet().addRow = mockAddRow;
    
          jest.spyOn(ExcelJS, 'Workbook').mockReturnValue(mockWorkbook);
          const libros = [{ titulo: 'Libro A', autor: 'Autor A' }];
          mockLibroModel.findAndCountAll.mockResolvedValue({ rows: libros, count: 1 });
    
          await service.exportToExcel(mockRes);
    
          expect(ExcelJS.Workbook).toHaveBeenCalled();
          expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Libros');
          expect(mockAddRow).toHaveBeenCalledWith(libros[0]); // Verifica addRow
          expect(mockWorkbook.xlsx.write).toHaveBeenCalledWith(mockRes);
          expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=libros.xlsx');
        });
    
        it('debería manejar errores al exportar a Excel', async () => {
          const mockRes = {
            setHeader: jest.fn(),
            end: jest.fn(),
          } as unknown as Response;
    
          const error = new Error('Error al exportar');
          jest.spyOn(ExcelJS, 'Workbook').mockImplementation(() => {
            throw error;
          });
    
          await expect(service.exportToExcel(mockRes)).rejects.toThrow(error);
        });
      });
});

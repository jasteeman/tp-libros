import { Test, TestingModule } from "@nestjs/testing";
import { LibrosService } from "./libro.service";
import { NotFoundException } from "@nestjs/common";

describe('LibrosService', () => {
    let service: LibrosService;

    const mockLibroModel = {
        create: jest.fn(),
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
    });
});

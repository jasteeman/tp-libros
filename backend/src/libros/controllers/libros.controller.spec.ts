import { Test, TestingModule } from '@nestjs/testing';
import { LibrosController } from './libros.controller';
import { LibrosService } from '../services/libro.service';

describe('LibrosController', () => {
  let controller: LibrosController;
  let service: LibrosService;

  const mockLibrosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    exportToExcel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibrosController],
      providers: [
        { provide: LibrosService, useValue: mockLibrosService },
      ],
    }).compile();

    controller = module.get<LibrosController>(LibrosController);
    service = module.get<LibrosService>(LibrosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create libro', async () => {
    const dto = { titulo: 'Test', autor: 'Autor' };
    mockLibrosService.create.mockResolvedValue(dto);

    const result = await controller.create(dto as any);
    expect(result).toEqual(dto);
    expect(mockLibrosService.create).toHaveBeenCalledWith(dto);
  });

  it('should call findOne', async () => {
    const libro = { id: 1, titulo: 'Test' };
    mockLibrosService.findOne.mockResolvedValue(libro);

    const result = await controller.findOne('1');
    expect(result).toEqual(libro);
  });

  it('should call remove', async () => {
    mockLibrosService.remove.mockResolvedValue(undefined);

    const result = await controller.remove('1');
    expect(result).toEqual({ message: 'Libro con ID 1 eliminado' });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { getModelToken } from '@nestjs/sequelize';
import { Usuario } from '../entities/usuario.entity';
import * as bcrypt from 'bcryptjs';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let usuarioModel: typeof Usuario;

  const mockUsuario = {
    id: 1,
    username: 'test',
    email: 'test@test.com',
    password: 'hashedpass',
    dataValues: {
      id: 1,
      username: 'test',
      email: 'test@test.com',
    },
    destroy: jest.fn(),
  };

  const mockUsuarioModel = {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getModelToken(Usuario),
          useValue: mockUsuarioModel,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    usuarioModel = module.get<typeof Usuario>(getModelToken(Usuario));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should hash the password and create a user', async () => { 
      (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue('hashed123');

      mockUsuarioModel.create.mockResolvedValue({ dataValues: mockUsuario });

      const result = await service.create({
        username: 'test',
        email: 'test@test.com',
        password: '1234',
        apellido:'testApe',
        nombre:'testName'
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
      expect(mockUsuarioModel.create).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashed123' }));
      expect(result).toEqual(mockUsuario);
    });
  });

  describe('findAll', () => {
    it('should return users and count', async () => {
      const expected = { rows: [mockUsuario], count: 1 };
      mockUsuarioModel.findAndCountAll.mockResolvedValue(expected);

      const result = await service.findAll();
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(mockUsuario);
      const result = await service.findOne(1);
      expect(result).toEqual(mockUsuario.dataValues);
    });

    it('should return null if not found', async () => {
      mockUsuarioModel.findByPk.mockResolvedValue(null);
      const result = await service.findOne(99);
      expect(result).toBeNull();
    });
  });

  describe('findOneByUsername', () => {
    it('should return user by username', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(mockUsuario);
      const result = await service.findOneByUsername('test');
      expect(result).toEqual(mockUsuario.dataValues);
    });
  });

  describe('findOneByEmail', () => {
    it('should return user by email', async () => {
      mockUsuarioModel.findOne.mockResolvedValue(mockUsuario);
      const result = await service.findOneByEmail('test@test.com');
      expect(result).toEqual(mockUsuario.dataValues);
    });
  });

  describe('update', () => {
    it('should hash password and update user', async () => {
      const updatedUser = { ...mockUsuario };
      (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue('hashedPassword');
      mockUsuarioModel.update.mockResolvedValue([1, [updatedUser]]);
      const result = await service.update(1, { password: '1234' });
      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
      expect(result).toEqual([1, [mockUsuario.dataValues]]);
    });
  });

  describe('remove', () => {
    it('should call destroy if user exists', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUsuario.dataValues as any);
      mockUsuario.destroy = jest.fn();
 
      const spy = jest.spyOn(mockUsuario, 'destroy').mockResolvedValue(mockUsuario as any);
 
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUsuario as any);

      await service.remove(1);
      expect(spy).toHaveBeenCalled();
    });

    it('should do nothing if user not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);
      await expect(service.remove(99)).resolves.toBeUndefined();
    });
  });
});

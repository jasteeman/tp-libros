import { Libro } from './entities/libro.entity';

export const libroProviders = [
  {
    provide: 'Libro',
    useValue: Libro,
  },
];
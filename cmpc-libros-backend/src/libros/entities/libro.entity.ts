import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType, DeletedAt } from 'sequelize-typescript';

@Table({
  tableName: 'libros',
  timestamps: true,
  paranoid: true,
})
export class Libro extends Model<Libro> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.STRING)
  titulo: string;

  @Column(DataType.STRING)
  autor: string;

  @Column(DataType.STRING)
  editorial: string;

  @Column(DataType.DECIMAL(10, 2))
  precio: number;

  @Column(DataType.BOOLEAN)
  disponibilidad: boolean;

  @Column(DataType.STRING)
  genero: string;

  @Column(DataType.STRING)
  imagenUrl: string;

  @DeletedAt
  declare deletedAt: Date;
}
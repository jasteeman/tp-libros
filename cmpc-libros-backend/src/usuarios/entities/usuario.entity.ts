import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'usuarios',
  timestamps: true,
})
export class Usuario extends Model<Usuario> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.STRING)
  username!: string;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  password!: string;

  @Column(DataType.STRING)
  nombre!: string;

  @Column(DataType.STRING)
  apellido!: string; 

  @Column(DataType.BOOLEAN)
  enabled!: boolean;
}
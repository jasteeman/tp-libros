import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateLibroDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  autor?: string;

  @IsOptional()
  @IsString()
  editorial?: string;

  @IsOptional()
  @IsNumber()
  precio?: number;

  @IsOptional()
  @IsBoolean()
  disponibilidad?: boolean;

  @IsOptional()
  @IsString()
  genero?: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;
}
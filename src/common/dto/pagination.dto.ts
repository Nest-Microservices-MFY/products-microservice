import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  public page?: number = 1;

  @IsInt()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  public limit?: number = 10;
}

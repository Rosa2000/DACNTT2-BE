import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserGrowthQueryDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(12)
  @ApiPropertyOptional({
    description: 'Số tháng muốn xem dữ liệu (1-12 tháng)',
    default: 3,
    minimum: 1,
    maximum: 12
  })
  months?: number = 3;
} 
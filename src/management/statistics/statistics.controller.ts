import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserGrowthQueryDto } from './statistics.dto';

@Controller("/v1/statistics")
@ApiTags("API thống kê")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('user_growth')
  @ApiOperation({ summary: 'Lấy dữ liệu tăng trưởng người dùng' })
  async getUserGrowth(@Query() query: UserGrowthQueryDto) {
    return await this.statisticsService.getUserGrowth(query.months);
  }
} 
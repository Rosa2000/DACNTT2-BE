import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInformation } from '../users/user_management.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(UserInformation)
    private readonly userRepository: Repository<UserInformation>,
  ) {}

  async getUserGrowth(months: number = 3) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      // Lấy dữ liệu tăng trưởng người dùng theo tháng bằng QueryBuilder
      const monthlyData = await this.userRepository
        .createQueryBuilder('user')
        .select("TO_CHAR(DATE_TRUNC('month', user.created_date), 'YYYY-MM')", 'date')
        .addSelect('COUNT(*)', 'count')
        .addSelect(
          `SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', user.created_date))`,
          'value'
        )
        .where('user.created_date >= :startDate', { startDate })
        .groupBy("DATE_TRUNC('month', user.created_date)")
        .orderBy("DATE_TRUNC('month', user.created_date)")
        .getRawMany();

      const totalNewUsers = await this.userRepository
        .createQueryBuilder('user')
        .select('COUNT(*)', 'total')
        .where('user.created_date >= :startDate', { startDate })
        .getRawOne();

      return {
        code: 0,
        message: 'Lấy dữ liệu tăng trưởng người dùng thành công',
        data: {
          monthlyData,
          totalNewUsers: parseInt(totalNewUsers.total) || 0,
          period: `${months} tháng gần nhất`
        }
      };
    } catch (error) {
      return {
        code: -1,
        message: 'Lỗi khi lấy dữ liệu tăng trưởng người dùng',
        error: error.message
      };
    }
  }  
} 
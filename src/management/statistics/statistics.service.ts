import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInformation } from '../users/entities/user_management/user_management.entity';

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
  
      const monthlyData = await this.userRepository.query(
        `
        SELECT
          to_char(months.month, 'YYYY-MM') AS date,
          SUM(months.count) OVER (ORDER BY months.month) AS value
        FROM (
          SELECT
            DATE_TRUNC('month', created_date) AS month,
            COUNT(*) AS count
          FROM users
          WHERE created_date >= $1
          GROUP BY DATE_TRUNC('month', created_date)
        ) AS months
        ORDER BY months.month
        `,
        [startDate]
      );
  
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
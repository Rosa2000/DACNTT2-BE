import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";
import { responseMessage } from "src/utils/constant";

@Injectable()
export class AdminGuardMiddleware implements NestMiddleware {
  async use(req: any, res: Response, next: NextFunction) {
    try {
      // Kiểm tra xem user đã được xác thực chưa
      if (!req.userData) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          code: -3,
          message: responseMessage.unauthenticate
        });
      }

      // Kiểm tra user có phải admin không
      const userGroup = req.userData.user_group;
      if (!userGroup || userGroup.name !== 'admin') {
        return res.status(HttpStatus.FORBIDDEN).json({
          code: -4,
          message: "Bạn không có quyền truy cập vào tài nguyên này"
        });
      }

      // Nếu là admin thì cho phép tiếp tục
      return next();
    } catch (error) {
      console.error("admin_guard", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }
} 
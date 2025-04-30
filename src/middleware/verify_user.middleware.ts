import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import { NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { Status } from "src/management/common/status/entities/status.entity";
import { UserVerifyInformation } from "src/management/users/entities/user_authenticate/user_authenticate.entity";
import { responseMessage } from "src/utils/constant";
import { Repository } from "typeorm";
dotenv.config();

@Injectable()
export class VerifyLoginMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(UserVerifyInformation)
    private readonly userRepository: Repository<UserVerifyInformation>,

    @InjectRepository(Status)
    private readonly StatusRespository: Repository<Status>
  ) {}

  async use(req: any, res: any, next: NextFunction) {
    try {
      const accessTokenSecret: string = process.env.JWT_SECRET || "";
      if (!accessTokenSecret) {
        throw new Error(
          "JWT_SECRET is not defined in the environment variables."
        );
      }
      const token: string = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res
          .status(HttpStatus.OK)
          .json({ code: -3, message: responseMessage.unauthenticate });
      }

      const decoded = jwt.verify(token, accessTokenSecret);
      req.userData = decoded;
      if (req.userData) {
        //MD: Thêm luống xử lý logic của user
        const userQueryBuilder = this.userRepository
          .createQueryBuilder("users")
          .where("users.status_id != :statusId", { statusId: 2 })
          .leftJoinAndSelect("users.user_group", "user_group")
          .andWhere("users.username = :username ", {
            username: req.userData.username
          });

        const user = await userQueryBuilder.getOne();
        if (!user) {
          return res
            .status(HttpStatus.OK)
            .json({ code: -3, message: responseMessage.unauthenticate });
        }

        const status = await this.StatusRespository.findOne({
          where: { id: user.status_id }
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, status_id, ...userWithoutSensitiveData } = user;
        req.userData = {
          ...userWithoutSensitiveData
        };

        return next();
      } else {
        return res
          .status(HttpStatus.OK)
          .json({ code: -3, message: responseMessage.unauthenticate });
      }
    } catch (error) {
      if (error) {
        return res
          .status(HttpStatus.OK)
          .json({ code: -3, message: responseMessage.unauthenticate });
      } else {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ code: -5, message: responseMessage.serviceError });
      }
    }
  }
}

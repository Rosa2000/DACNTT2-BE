import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { responseMessage } from "src/utils/constant";
import {
  ManagementLoginResponseData,
  ResetPasswordData
} from "./auth.interface";
import { RegisterManagementDto } from "./auth.dto";
import { AddUserInformation } from "../users/user_management.entity";
import {
  GroupRole,
  UserGroup
} from "src/management/user_groups/user_group.entity";
import { CustomMailerService } from "src/services/mailer/mailer.service";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

@Injectable()
export class UserAuthenticateService {
  constructor(
    @InjectRepository(AddUserInformation)
    private readonly userRepository: Repository<AddUserInformation>,

    @InjectRepository(GroupRole)
    private readonly groupRoleRepository: Repository<GroupRole>,

    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,

    private readonly mailerService: CustomMailerService
  ) {}

  private generateAccessToken(user: any): any {
    const payload = { username: user?.username, sub: user?.id?.toString() };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "86400s" });
  }

  async validateUserManagement(
    username: string,
    password: string
  ): Promise<ManagementLoginResponseData | null> {
    try {
      if (!username || !password) {
        throw new BadRequestException({
          code: -2,
          message: responseMessage.badRequest
        });
      }

      const user = await this.userRepository.findOne({
        where: {
          username,
          status_id: Not(2) // TypeORM Not operator
        }
      });

      if (!user) {
        throw new UnauthorizedException({
          code: -1,
          message: "Tên đăng nhập không đúng hoặc không tồn tại"
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException({
          code: -3,
          message: "Sai mật khẩu"
        });
      }

      const accessToken = this.generateAccessToken(user);
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: { ...userWithoutPassword, id: userWithoutPassword.id.toString() },
        accessToken
      };
    } catch (error) {
      console.error("error1", error);
      if ( error instanceof BadRequestException || error instanceof UnauthorizedException) {
        console.log("error2", error);
        throw error;
      } else {
        throw new InternalServerErrorException({
          code: -5,
          message: responseMessage.serviceError
        });
      }
    }
  }

  async registerUserManagement(
    registerManagementDto: RegisterManagementDto
  ): Promise<any> {
    const { fullname, email, username, phoneNumber, password, isAdmin } =
      registerManagementDto;

    const user = await this.userRepository.findOne({ where: { username } });
    if (user) {
      throw new ConflictException({ code: -1, message: "Tên đăng nhập này đã được sử dụng" });
    }

    if (!email && !username) {
      throw new BadRequestException({
        code: -2,
        message: "Email/Tên đăng nhập bị thiếu"
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = this.userRepository.create({
        fullname,
        email,
        phone_number: phoneNumber,
        username,
        password: hashedPassword,
        status_id: 1,
        gender: "", // Giá trị mặc định, có thể yêu cầu trong DTO nếu cần
        address: "",
        ward: "",
        district: "",
        province: "",
        country: "",
        modified_date: new Date()
      });
      const savedUser = await this.userRepository.save(newUser);

      // Gán group role
      const groupId = isAdmin ? 1 : 2; // 1 cho admin, 2 cho user thường
      const groupRole = await this.groupRoleRepository.findOne({
        where: { id: groupId } // Giả định id trong GroupRole là ObjectId
      });

      if (!groupRole) {
        throw new InternalServerErrorException({
          code: -4,
          message: responseMessage.notFound
        });
      }

      const newUserGroup = this.userGroupRepository.create({
        group_id: groupId, // Lưu ý: Nếu group_id cần là ObjectId, cần điều chỉnh
        user_id: savedUser.id
      });
      await this.userGroupRepository.save(newUserGroup);
      return savedUser;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  async getVerifyEmail(email: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email,
          status_id: Not(2)
        }
      });

      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword };
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await this.userRepository.findOne({
        where: { email: decoded.email, status_id: Not(2) },
      });
  
      if (!user) {
        throw new NotFoundException({
          code: -4,
          message: 'Không tìm thấy người dùng phù hợp với token',
        });
      }
  
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      user.modified_date = new Date();
      await this.userRepository.save(user);
  
      return { code: 0, message: 'Đổi mật khẩu thành công' };
    } catch (error) {
      console.error(error);
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          code: -6,
          message: 'Token đã hết hạn, vui lòng yêu cầu lại.',
        });
      }
      throw new UnauthorizedException({
        code: -6,
        message: 'Token không hợp lệ',
      });
    }
  }
  

async handleForgotPassword(email: string): Promise<any> {
  try {
    const user = await this.userRepository.findOne({
      where: { email, status_id: Not(2) },
    });

    if (user) {
      const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '15m' });
      await this.mailerService.sendResetPasswordMail(user.email, token);
      console.log(`Đã gửi mail reset cho: ${user.email} với token: ${token}`);
    }

    return {
      code: 0,
      message: 'Nếu email tồn tại, hệ thống sẽ gửi hướng dẫn khôi phục mật khẩu.',
    };
  } catch (error) {
    console.error(error);
    throw new InternalServerErrorException({
      code: -5,
      message: responseMessage.serviceError,
    });
  }
}
}

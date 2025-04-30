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
} from "../../interfaces/user_authenticate/user_authenticate.interface";
import { RegisterManagementDto } from "../../dtos/user_authenticate/user_authenticate.dto";
import { AddUserInformation } from "../../entities/user_management/user_management.entity";
import {
  GroupRole,
  UserGroup
} from "src/management/user_groups/entities/user_group/user_group.entity";

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
    private readonly userGroupRepository: Repository<UserGroup>
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
          message: "Password không đúng"
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
      throw new ConflictException({ code: -1, message: "User này đã tồn tại" });
    }

    if (!email && !username) {
      throw new BadRequestException({
        code: -2,
        message: "Email/Username bị thiếu"
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

  async handleResetPassword(
    resetPasswordData: ResetPasswordData
  ): Promise<any> {
    try {
      const { email, username, newPassword } = resetPasswordData;

      const user = await this.userRepository.findOne({
        where: {
          email,
          username,
          status_id: Not(2)
        }
      });

      if (!user) {
        throw new NotFoundException({
          code: -4,
          message: responseMessage.notFound
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.modified_date = new Date();

      await this.userRepository.save(user);
      return;
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }
}

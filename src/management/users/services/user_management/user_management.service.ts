import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, Not } from "typeorm";
import * as bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { responseMessage } from "src/utils/constant";
import {
  GroupRole,
  UserGroup
} from "src/management/user_groups/entities/user_group/user_group.entity";
import {
  AddUserInformation,
  UserInformation
} from "../../entities/user_management/user_management.entity";
import {
  AddUserManagementDto,
  EditUserManagementDto
} from "../../dtos/user_management/user_management.dto";
import { ChangePasswordData } from "../../interfaces/user_management/user_management.interface";

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(UserInformation)
    private readonly userRepository: Repository<UserInformation>,
    @InjectRepository(AddUserInformation)
    private readonly addUserRepository: Repository<AddUserInformation>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(GroupRole)
    private readonly groupRoleRepository: Repository<GroupRole>
  ) {}

  async findListUser(
    page: number,
    pageSize: number,
    filters?: string,
    groupId?: number
  ): Promise<any> {
    try {
      page = Math.max(1, page);

      // Tìm user với quan hệ user_group
      const query: any = {
        status_id: { $ne: 2 } // MongoDB $ne thay cho !=
      };

      if (groupId) {
        const usersInGroup = await this.userGroupRepository.find({
          where: { group_id: groupId }
        });
        const userIds = usersInGroup.map(
          (group) => new ObjectId(group.user_id)
        );
        query.id = { $in: userIds };
      }

      if (filters) {
        query.$or = [
          { fullname: { $regex: filters, $options: "i" } },
          { username: { $regex: filters, $options: "i" } },
          { email: { $regex: filters, $options: "i" } },
          { phone_number: filters.trim() },
          { id: { $regex: filters, $options: "i" } }
        ];
      }

      const [userListData, totalItem] = await Promise.all([
        this.userRepository.find({
          where: query,
          relations: ["user_group"], // Load quan hệ user_group
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        this.userRepository.count({ where: query })
      ]);

      const transformedData = userListData.map((item) => ({
        id: item.id.toString(),
        fullname: item.fullname,
        email: item.email,
        phone_number: item.phone_number,
        gender: item.gender,
        address: item.address,
        ward: item.ward,
        district: item.district,
        province: item.province,
        country: item.country,
        username: item.username,
        status_id: item.status_id,
        user_group: item.user_group.map((detail) => detail.group_id)
      }));

      const totalPages = Math.ceil(totalItem / pageSize);
      return {
        data: transformedData.length > 0 ? transformedData : [],
        total: totalItem,
        totalPages
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  async handleEditUser(
    id: number,
    dataUser: EditUserManagementDto
  ): Promise<any> {
    const {
      fullname,
      address,
      country,
      district,
      email,
      gender,
      phoneNumber,
      province,
      ward,
      userGroupId
    } = dataUser.data;

    try {
      const existingUser = await this.userRepository.findOne({
        where: { id: id }
      });
      if (!existingUser) {
        throw new NotFoundException({
          code: -4,
          message: responseMessage.notFound
        });
      }

      const existUserGroup = await this.userGroupRepository.find({
        where: { user_id: id }
      });
      const existingGroupIds = existUserGroup.map((group) =>
        Number(group.group_id)
      );

      // Xóa các nhóm không còn trong danh sách
      const groupsToRemove = existingGroupIds.filter(
        (groupId) => !(userGroupId ?? []).includes(groupId)
      );
      if (groupsToRemove.length > 0) {
        await this.userGroupRepository.delete({
          user_id: id,
          group_id: In(groupsToRemove)
        });
      }

      // Thêm mới các nhóm
      const promises: Promise<any>[] = [];
      for (const groupId of userGroupId ?? []) {
        if (!existingGroupIds.includes(groupId)) {
          const newUserGroup = this.userGroupRepository.create({
            user_id: id,
            group_id: Number(groupId)
          });
          promises.push(this.userGroupRepository.save(newUserGroup));
        }
      }
      await Promise.all(promises);

      // Cập nhật thông tin user
      existingUser.fullname = fullname ?? existingUser.fullname;
      existingUser.address = address ?? existingUser.address;
      existingUser.country = country ?? existingUser.country;
      existingUser.district = district ?? existingUser.district;
      existingUser.email = email ?? existingUser.email;
      existingUser.gender = gender ?? existingUser.gender;
      existingUser.phone_number = phoneNumber ?? existingUser.phone_number;
      existingUser.province = province ?? existingUser.province;
      existingUser.ward = ward ?? existingUser.ward;
      existingUser.modified_date = new Date();

      const updatedUser = await this.userRepository.save(existingUser);
      return updatedUser;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  async handleAddUser(dataUser: AddUserManagementDto): Promise<any> {
    const {
      fullname,
      address,
      country,
      district,
      email,
      gender,
      phoneNumber,
      province,
      ward,
      username,
      password,
      userGroupId
    } = dataUser.data;

    try {
      const existingUser = await this.addUserRepository.findOne({
        where: { username }
      });
      if (!email && !username) {
        throw new BadRequestException({
          code: -2,
          message: "Email/Username bị thiếu"
        });
      }

      if (existingUser) {
        throw new ConflictException({
          code: -1,
          message: "User này đã tồn tại"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = this.addUserRepository.create({
        fullname,
        address,
        country,
        district,
        email,
        gender,
        phone_number: phoneNumber,
        province,
        ward,
        username,
        password: hashedPassword,
        status_id: 1,
        modified_date: new Date()
      });

      const addedUser = await this.addUserRepository.save(newUser);

      // Thêm user_group
      const promises: Promise<any>[] = [];
      for (const groupId of userGroupId ?? []) {
        const newUserGroup = this.userGroupRepository.create({
          user_id: addedUser.id,
          group_id: Number(groupId)
        });
        promises.push(this.userGroupRepository.save(newUserGroup));
      }
      await Promise.all(promises);

      return addedUser;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  async handleDeleteUser(id: number): Promise<UserInformation> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { id: id }
      });
      if (!existingUser) {
        throw new ConflictException({
          code: -4,
          message: responseMessage.notFound
        });
      }

      existingUser.status_id = 2;
      existingUser.modified_date = new Date();
      existingUser.deleted_date = new Date();

      await this.userRepository.save(existingUser);
      return existingUser;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  async handleChangePassword(
    id: number,
    changePasswordData: ChangePasswordData
  ): Promise<any> {
    try {
      if (!id) {
        throw new NotFoundException({
          code: -4,
          message: responseMessage.notFound
        });
      }

      const { email, username, newPassword, oldPassword } = changePasswordData;
      const user = await this.addUserRepository.findOne({
        where: { email, username, status_id: Not(2) }
      });

      if (!user) {
        throw new NotFoundException({
          code: -4,
          message: responseMessage.notFound
        });
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException({
          code: -3,
          message: "Password cũ không đúng"
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.modified_date = new Date();

      await this.addUserRepository.save(user);
    } catch (error) {
      console.error(error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, Not, Brackets } from "typeorm";
import * as bcrypt from "bcrypt";
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

  async getUserList({
    page,
    pageSize,
    filters,
    groupId,
    sortOrder = "asc",
    statusId
  }: {
    page: number,
    pageSize: number,
    filters: any,
    groupId?: number,
    sortOrder?: "asc" | "desc",
    statusId?: number
  }): Promise<any> {
    try {
      page = Math.max(1, page);
      let userQueryBuilder = this.userRepository
        .createQueryBuilder("users")
        .leftJoinAndSelect("users.user_group", "user_group");
      if (typeof statusId === 'number' && !isNaN(statusId)) {
        userQueryBuilder = userQueryBuilder.andWhere("users.status_id = :statusId", { statusId });
      }
      if (filters) {
        userQueryBuilder = userQueryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where("users.fullname ILIKE :filters", { filters: `%${filters}%` })
              .orWhere("users.username ILIKE :filters", { filters: `%${filters}%` })
              .orWhere("users.email ILIKE :filters", { filters: `%${filters}%` })
              .orWhere("TRIM(users.phone_number) = :phoneNumber", {
                phoneNumber: filters.trim()
              })
              .orWhere("CAST(users.id AS VARCHAR) LIKE :filters", {
                filters: `%${filters}%`
              });
          })
        );
      }
      if (groupId) {
        userQueryBuilder = userQueryBuilder
          .andWhere("EXISTS (SELECT 1 FROM user_group ug WHERE ug.user_id = users.id AND ug.group_id = :groupId)", {
            groupId
          });
      }
      const [userListData, totalItem] = await userQueryBuilder
        .orderBy("users.created_date", sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC")
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();
      const transformedData = userListData
        ? userListData.map((item) => ({
            id: item.id,
            fullname: item.fullname,
            email: item.email,
            username: item.username,
            status_id: item.status_id,
            created_date: item.created_date,
            user_group: item.user_group.map((detail) => detail.group_id)
          }))
        : [];
      const totalPages = Math.ceil(totalItem / pageSize);
      return {
        data: transformedData.length > 0 ? transformedData : [],
        total: totalItem,
        totalPages,
        currentPage: page,
        pageSize
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  async getUserById(id: number): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ["user_group"]
      });
  
      if (!user) {
        throw new NotFoundException({
          code: -4,
          message: responseMessage.notFound
        });
      }
  
      return {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone_number: user.phone_number,
        gender: user.gender,
        address: user.address,
        ward: user.ward,
        district: user.district,
        province: user.province,
        country: user.country,
        username: user.username,
        status_id: user.status_id,
        created_date: user.created_date,
        modified_date: user.modified_date,
        user_group: user.user_group?.map((g) => g.group_id)
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }
  

  async updateUser(
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

  async createUser(dataUser: AddUserManagementDto): Promise<any> {
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

  async deleteUser(id: number): Promise<UserInformation> {
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

  async restoreUser(id: number): Promise<any> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { id, status_id: 2 }
      });
      if (!existingUser) {
        throw new NotFoundException({
          code: -4,
          message: `Không tìm thấy người dùng với ID ${id}`
        });
      }
      await this.userRepository.update(
        { id },
        { status_id: 1, deleted_date: undefined, modified_date: new Date() }
      );
      return { code: 0, message: responseMessage.success };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  async changePassword(
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
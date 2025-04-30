import {
  ConflictException,
  Injectable,
  InternalServerErrorException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { responseMessage } from "src/utils/constant";

import { GroupRole } from "../../entities/user_group/user_group.entity";
import { GroupRoleListRequestData } from "../../interfaces/user_group/user_group.interface";
import { UserGroup } from "../../entities/user_group/user_group.entity";
@Injectable()
export class UserGroupService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(GroupRole)
    private readonly groupRoleRepository: Repository<GroupRole>
  ) {}

  async findListGroup(
    page: number,
    pageSize: number,
    filters: string,
    level: number,
    parentId: number[],
    roleId: number[]
  ): Promise<any> {
    page = Math.max(1, page);
    let queryBuilder = this.groupRoleRepository
      .createQueryBuilder("group_role")
      .where("group_role.status_id = :statusId", { statusId: 1 });
    const newParentId = parentId.map((item) => Number(item));

    if (level) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.orWhere("group_role.level = :level", { level });
        })
      );
    }

    if (parentId.length > 0) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.orWhere("group_role.parent_id IN (:...parentId)", {
            parentId: newParentId
          });
        })
      );
    }

    if (filters) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("group_role.title = :title", { title: filters }).orWhere(
            "group_role.permission = :permission",
            { permission: filters }
          );
        })
      );
    }

    if (roleId.length > 0) {
      queryBuilder = queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.orWhere("group_role.id IN (:...roleId)", { roleId });
        })
      );
    }

    const [groupRoleData, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: groupRoleData.length > 0 ? groupRoleData : [],
      total,
      totalPages
    };
  }

  async addGroupRole(roleData: GroupRoleListRequestData): Promise<any> {
    const { title, description, permission } = roleData;

    const existGroupRole = await this.groupRoleRepository.findOne({
      where: { title }
    });

    if (existGroupRole) {
      throw new ConflictException({
        code: -1,
        message: "Vai trò này đã tồn tại"
      });
    }

    try {
      const newGroupRole = this.groupRoleRepository.create({
        title,
        description,
        permission,
        status_id: 1
      });
      await this.groupRoleRepository.save(newGroupRole);

      return newGroupRole;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  async handleEditGroupRole(
    id: number,
    roleData: GroupRoleListRequestData
  ): Promise<any> {
    const { title, description, permission } = roleData;

    const existGroupRole = await this.groupRoleRepository.findOne({
      where: { title }
    });

    if (!existGroupRole) {
      throw new ConflictException({
        code: -4,
        message: responseMessage.notFound
      });
    }

    try {
      await this.groupRoleRepository.update(id, {
        title,
        description,
        permission,
        status_id: 1,
        modified_date: new Date()
      });

      const updateGroupRole = await this.groupRoleRepository.findOne({
        where: { title }
      });
      return updateGroupRole;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }

  async handleDeleteGroupRole(id: number): Promise<any> {
    try {
      // Check if the Payment Method exists
      const existGroupRole = await this.groupRoleRepository.findOne({
        where: { id }
      });
      if (!existGroupRole) {
        throw new ConflictException({
          code: -4,
          message: responseMessage.notFound
        });
      }
      // Change Status
      await this.groupRoleRepository.update(id, {
        status_id: 2,
        modified_date: new Date(),
        deleted_date: new Date()
      });
      return existGroupRole;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        code: -5,
        message: responseMessage.serviceError
      });
    }
  }
}

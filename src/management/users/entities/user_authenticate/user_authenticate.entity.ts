import { UserGroup } from "src/management/user_groups/entities/user_group/user_group.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity("users")
export class UserLoginInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  status_id: number;
}

@Entity("users")
export class UserVerifyInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullname: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  status_id: number;

  @OneToMany(() => UserGroup, (userGroup) => userGroup.user_verify)
  user_group: UserGroup[];
}

@Entity("users")
export class UserChangePassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  modified_date: Date;
}

@Entity("users")
export class ChangePasswordInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  modified_date: Date;
}

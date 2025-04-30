export interface UserListRequestData {
  page?: number;
  pageSize?: number;
  filters?: string;
  groupId?: number;
}

export interface UserEditRequestData {
  data: {
    fullname?: string;
    email?: string;
    phoneNumber?: string;
    citizenId?: string;
    gender?: string;
    address?: string;
    ward?: string;
    district?: string;
    province?: string;
    country?: string;
    postcode?: string;
    groupId?: Array<number>;
    groupIdLv2?: Array<number>;
    groupIdLv3?: Array<number>;
  };
}

export interface UserAddRequestData {
  data: {
    fullname?: string;
    email?: string;
    phoneNumber?: string;
    citizenId?: string;
    gender?: string;
    address?: string;
    ward?: string;
    district?: string;
    province?: string;
    country?: string;
    postcode?: string;
    username?: string;
    password?: string;
    groupId?: Array<number>;
    groupIdLv2?: Array<number>;
    groupIdLv3?: Array<number>;
  };
}
export interface ChangePasswordData {
  username?: string;
  email?: string;
  oldPassword?: string;
  newPassword?: string;
}

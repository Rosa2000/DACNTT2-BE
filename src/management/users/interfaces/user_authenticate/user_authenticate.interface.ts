export interface ManagementLoginRequestData {
  username: string;
  password: string;
}

export interface ManagementLoginOAUTHRequestData {
  email: string;
}

export interface ManagementLoginResponseData {
  user: {
    id: string;
    email: string;
    username: string;
  };
  accessToken: string;
}

export interface RegisterManagementRequestData {
  fullname: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
  isAdmin: boolean;
}
export interface ResetPasswordData {
  username?: string;
  email?: string;
  newPassword?: string;
}

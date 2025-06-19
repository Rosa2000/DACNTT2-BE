export interface UserGroupListRequestData {
  page?: number;
  pageSize?: number;
  filters?: string;
  level?: number;
  parentId?: number;
}

export interface GroupRoleListRequestData {
  title?: string;
  description?: string;
  permission?: string;
  permission_level2?: string;
  permission_level3?: string;
}

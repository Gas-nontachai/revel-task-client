export type AuthToken = {
  access_token: string;
  refresh_token: string;
};

export type License = {
  license_id: string,
  license_name: string,
  license_all_branch: boolean,
  license_primary?: boolean,
  addby?: string,
  adddate?: Date,
  updateby?: string,
  lastupdate?: string,
};

export type LicenseNotify = {
  license_notify_id: string,
  notify_event_id: string,
  license_id: string,
  is_notify_active: boolean,
  is_email_active: boolean,
  notify_event_group: number,
  notify_event_name: string,
};

export type Permission = {
  menu_id: string,
  license_id: string,
  menu_group: number,
  menu_name_th: string,
  menu_name_en: string,
  permission_view: boolean,
  permission_add: boolean,
  permission_edit: boolean,
  permission_approve: boolean,
  permission_delete: boolean,
};

export type RefreshToken = {
  id: number;
  token_id: string;
  user_id: number;
  is_active: boolean;
  date_created: DateTime;
};

export type Session = {
  id: number;
  user_id: number;
  sid: string;
  start_time: DateTime;
  end_time?: DateTime;
  access_token: string;
  csrf_token: string;
  is_active: boolean;
  ip_address: string;
};
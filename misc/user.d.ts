import { License } from './auth'

export type User = {
  user_id: string;
  license_id: string;
  user_prefix: string,
  user_firstname: string;
  user_lastname: string;
  user_tel: string;
  user_email: string;
  user_username: string;
  user_password: string;
  user_address: string;
  user_img: string;
  user_status: string;
  addby?: string,
  adddate?: Date,
  updateby?: string,
  lastupdate?: Date | string,
  user_fullname?: string,
  license_name?: string,
  license?: License,
};

export type UserPosition = {
  user_position_id: string;
  user_position_name: string;
  addby?: string,
  adddate?: Date,
  updateby?: string,
  lastupdate?: string,
};
import { User } from "./user";

export type Company = {
  company_id: string,
  company_name: string,
  company_tel: string,
  company_address: string,
  addby?: string,
  adddate?: Date,
  updateby?: string,
  lastupdate?: Date,
}

export type UserBranch = {
  user_branch_id: string,
  company_id: string,
  user_id: string,
  user?: User,
}

export type Branch = {
  branch_id: string,
  company_id: string,
  branch_name: string,
  branch_tel: string,
  branch_address: string,
  addby?: string,
  adddate?: Date,
  updateby?: string,
  lastupdate?: Date,
  company_name?: string,
}

export type SyncData = {
  sync_data_id: string,
  branch_id: string,
  company_id: string,
  sync_data_status: string,
  last_sync_time: Date | string,
}

export type SyncDataLog = {
  sync_data_log_id: string,
  sync_data_id: string,
  sync_data_start_date: string,
  sync_data_end_date: string,
  sync_data_result: string,
}
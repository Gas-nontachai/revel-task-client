import { Branch } from "./company"

export type BookBank = {
  book_bank_id: string,
  bank_id: string,
  book_bank_number: string,
  book_bank_name: string,
  book_bank_detail: string,
  addby?: string,
  adddate?: Date,
  updateby?: string,
  lastupdate?: string,
  bank_name?: string,
}

export type Bank = {
  bank_id: string,
  bank_code: string,
  bank_name: string,
}

export type BookBankBranch = {
  book_bank_branch_id: string,
  book_bank_id: string,
  branch_id: string,
  branch?: Branch,
}
import { BookBankBranch } from "~~/misc/types"

const prefix = 'book-bank-branch'

const getBookBankBranchBy = (data: any = {}): Promise<{ docs: BookBankBranch[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getBookBankBranchBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useBookBankBranch() {
  return {
    getBookBankBranchBy,
  };
}
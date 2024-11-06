import { UserBranch } from "~~/misc/types"

const prefix = 'user-branch'

const getUserBranchBy = (data: any = {}): Promise<{ docs: UserBranch[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getUserBranchBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useUserBranch() {
  return {
    getUserBranchBy,
  };
}
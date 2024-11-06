import { Permission } from "~~/misc/types"

const prefix = 'permission'

const getPermissionBy = (data: any = {}): Promise<{ docs: Permission[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getPermissionBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function usePermission() {
  return {
    getPermissionBy,
  };
}
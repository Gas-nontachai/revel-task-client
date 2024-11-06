import { AuthToken, Permission, User } from "~~/misc/types"

const prefix = 'auth'

const authLogin = (data: { user_username: string, user_password: string, }): Promise<any> => preSecureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/login`, {
  method: "POST",
  body: JSON.stringify(data),
})

const authLogout = (): Promise<any> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/logout`, { method: "POST", })

const getMyCredential = (): Promise<{ user: User, permissions: Permission[], }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getMyCredential`, {
  method: "POST",
})

const changePassword = (data: { current_password: string, new_password: string }): Promise<any> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/changePassword`, {
  method: "POST",
  body: JSON.stringify(data),
})

const refresh = (data: { refresh_token: string, }): Promise<AuthToken> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/refresh`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useAuth() {
  return {
    authLogin,
    authLogout,
    getMyCredential,
    changePassword,
    refresh,
  };
}
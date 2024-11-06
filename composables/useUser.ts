import { User } from "~~/misc/types"

const prefix = 'user'

const generateUserID = (): Promise<string> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/generateUserID`, { method: "POST", })

const getUserBy = (data: any = {}): Promise<{ docs: User[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getUserBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getUserByID = (data: { user_id: string }): Promise<User> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getUserByID`, {
  method: "POST",
  body: JSON.stringify(data),
})

const insertUser = async (data: { user: User, user_img?: File[], }): Promise<User> => {
  const formData = new FormData();
  formData.append("user", JSON.stringify(data.user));

  if (data.user_img?.length) formData.append("user_img", data.user_img[0]);

  return await secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertUser`, {
    method: "POST",
    body: formData,
  })
}

const updateUserBy = async (data: { user: User, user_img?: File[], }): Promise<User> => {
  const formData = new FormData();

  formData.append("user", JSON.stringify(data.user));

  if (data.user_img?.length) formData.append("user_img", data.user_img[0]);

  return await secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateUserBy`, {
    method: "POST",
    body: formData,
  })
}

const updatePasswordUserBy = (data: { user_id: string, new_password: string }): Promise<any> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updatePasswordUserBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const deleteUserBy = (data: { user_id: string }): Promise<User> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteUserBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useUser() {
  return {
    generateUserID,
    getUserBy,
    getUserByID,
    insertUser,
    updateUserBy,
    updatePasswordUserBy,
    deleteUserBy
  };
}
import { Notify, } from "~~/misc/types"

const prefix = 'notify'

const getNotifyBy = (data: any): Promise<{ docs: Notify[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getNotifyBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getMyNoti = (): Promise<{
  notifys: Notify[],
  menu_noti: { [key: string]: string },
}> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getMyNoti`, {
  method: "POST",
})

const getInitNotify = (data: { player_id: string }): Promise<{
  subscription: boolean,
}> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getInitNotify`, {
  method: "POST",
  body: JSON.stringify(data),
})

const seenNotifyBy = (data?: any): Promise<any> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/seenNotifyBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const deleteNotifyBy = (data?: any): Promise<any> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteNotifyBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useNotify() {
  return {
    getMyNoti,
    getNotifyBy,
    getInitNotify,
    seenNotifyBy,
    deleteNotifyBy,
  };
}
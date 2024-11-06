import { OnesignalPlayer } from "~~/misc/types"

const prefix = 'onesignal-player'

const updateOnesignalPlayerBy = (data: any): Promise<OnesignalPlayer> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateOnesignalPlayerBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useOnesignalPlayer() {
  return {
    updateOnesignalPlayerBy,
  };
}
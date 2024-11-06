import Swal from 'sweetalert2'
import { FetchOptions, } from "~~/misc/types"

export const preSecureFetch = (url: string, options: FetchOptions): Promise<any> => $fetch(url, options).then(responseInterceptor).catch(e => errorInterceptor(e, options))
export const secureFetch = async (url: string, options: FetchOptions): Promise<any> => {
  options.headers = { ...options.headers, ...useAccessHeader(), }

  return await $fetch(url, options).then(responseInterceptor).catch(e => errorInterceptor(e, options))
}

function useAccessHeader(): any {
  const access_token = useCookie('x-access-token')

  return {
    'x-access-token': access_token.value,
  }
}

export const responseInterceptor = (response: any): Promise<any> => {
  return Promise.resolve(response)
}

export const errorInterceptor = async (error: any, options: any): Promise<any> => {
  const { $auth } = useNuxtApp()

  if (error?.response) {
    const { status, statusText, _data, } = error.response

    if (status === 401 && _data.message === 'Invalid token') {
      if ($auth.refreshExpired()) {
        $auth.logout()

        return Promise.reject(new Error('Token expired'))
      }

      try {
        await $auth.refreshTokens()

        if (options.headers) options.headers = { ...options.headers, ...useAccessHeader() }

        return Promise.resolve(await $fetch(error.request, options))
      } catch (e) {
        $auth.logout()

        return Promise.reject(e)
      }
    }

    Swal.fire({ title: 'Request failed', text: _data.message || `${status} ${statusText}`, icon: "error", })
  } else {
    Swal.fire({ title: 'Unable to connect', text: 'Network or Server error', icon: "error", })
  }

  return Promise.reject(error)
}
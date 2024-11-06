import jwt_decode from "jwt-decode"

import { AuthToken, Permission, User, } from "~~/misc/types";
import { defineStore } from "pinia";

const { getMyCredential, refresh } = useAuth();

export const useAuthStore = defineStore("auth", () => {
  const access_token = useCookie('x-access-token');
  const refresh_token = useCookie('refresh-token');

  const user = ref(<User | null>null);
  const permissions = ref(<{ [key: string]: Permission }>{});
  const isLoggedIn = ref(false);

  const profile = computed(() => user.value);
  const accessToken = computed(() => access_token.value);
  const refreshToken = computed(() => access_token.value);

  async function initAuthorization() {
    try {
      if (!access_token.value) return;

      if (accessExpired()) {
        if (refreshExpired()) {
          return logout();
        } else {
          await refreshTokens();
        }
      }

      const credential = await getMyCredential();

      credential.permissions.forEach(item => {
        item.permission_view = !!item.permission_view
        item.permission_add = !!item.permission_add
        item.permission_edit = !!item.permission_edit
        item.permission_approve = !!item.permission_approve
        item.permission_delete = !!item.permission_delete
      })

      credential.permissions.forEach(item => {
        item.permission_view = !!item.permission_view
        item.permission_add = !!item.permission_add
        item.permission_edit = !!item.permission_edit
        item.permission_approve = !!item.permission_approve
        item.permission_delete = !!item.permission_delete

        permissions.value[item.menu_name_en] = item
      })

      user.value = credential.user;
      isLoggedIn.value = true;
    } catch (error) {
      clearAuth();
    }
  }

  function setAuthTokens(tokens: AuthToken) {
    access_token.value = tokens.access_token;
    refresh_token.value = tokens.refresh_token;
  }

  async function refreshTokens() {
    if (!refresh_token.value) return;

    const tokens = await refresh({ refresh_token: refresh_token.value });

    access_token.value = tokens.access_token;
    refresh_token.value = tokens.refresh_token;
  }

  function clearAuth() {
    user.value = null;
    isLoggedIn.value = false;
    access_token.value = null;
    refresh_token.value = null;
  }

  function logout() {
    clearAuth()

    window.location.href = '/'
  }

  const accessExpired = () => tokenExpired(access_token.value)
  const refreshExpired = () => tokenExpired(refresh_token.value)

  function tokenExpired(token: string | null | undefined) {
    if (!token) return true

    const { exp }: any = jwt_decode(token)

    return new Date(new Date(exp * 1000)) <= new Date()
  }

  const getPermission = (key?: string): Permission => {
    const no_access = {
      menu_id: '',
      license_id: '',
      menu_group: 0,
      menu_name_th: '',
      menu_name_en: '',
      permission_view: false,
      permission_add: false,
      permission_edit: false,
      permission_approve: false,
      permission_delete: false,
    }

    if (!key) return no_access

    return permissions.value[key] ?? no_access
  }

  return {
    profile,
    isLoggedIn,
    accessToken,
    refreshToken,
    getPermission,
    initAuthorization,
    clearAuth,
    logout,
    refreshExpired,
    refreshTokens,
    setAuthTokens,
  };
});
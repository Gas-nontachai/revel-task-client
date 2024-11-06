import protectors from '@/data/protectors'

const bypass = true

export default defineNuxtRouteMiddleware((to, from) => {
  const { $auth } = useNuxtApp()

  if (!$auth.isLoggedIn) return navigateTo('/auth/login')

  if (bypass) return

  if (to.name) {
    if (to.name === 'index') {
      for (const key in protectors) {
        const { permission_view } = $auth.getPermission(key)

        if (permission_view) return navigateTo(`/${key}`)
      }
    }

    const protector = protectors[to.name.toString()]

    if (!protector) return

    const {
      permission_view,
      permission_add,
      permission_edit,
    } = $auth.getPermission(protector.key)

    if (protector.access === 'view' && !permission_view) return abortNavigation()
    if (protector.access === 'add' && !permission_add) return abortNavigation()
    if (protector.access === 'edit' && !permission_edit) return abortNavigation()
  }
})
<script setup lang="ts">
import { User } from "~~/misc/types";

definePageMeta({
  layout: "blank",
});

const { $auth } = useNuxtApp()

const router = useRouter();

const { authLogin, } = useAuth();

const user = ref(<User>{});
const remember_me = ref(true);
const loginError = ref(<Error | null>null);

onMounted(() => {
  if ($auth.isLoggedIn) router.replace('/')
})

async function onLogin(e: FormDataEvent) {
  e.preventDefault()

  const { user_username, user_password, } = user.value

  if (!user_username) {
    loginError.value = {} as Error;
    loginError.value.message = "Username is required";
    return;
  }

  if (!user_password) {
    loginError.value = {} as Error;
    loginError.value.message = "Password is required";
    return;
  }

  try {
    const tokens = await authLogin({ user_username, user_password, });

    if (tokens) {
      $auth.setAuthTokens({
        access_token: tokens.access_token,
        refresh_token: remember_me ? tokens.refresh_token : '',
      });

      window.location.href = '/'
    }
  } catch (err) {
    console.log(err)
  }
}
</script>

<template>
  <div class="authentication">
    <v-container fluid class="pa-3">
      <form :onsubmit="onLogin">
        <div class="h-100vh d-flex justify-center align-center">
          <v-card rounded="md" elevation="10" class="px-sm-1 px-0 withbg mx-auto" max-width="900">
            <v-card-text class="py-8 pa-sm-8 pa-md-15">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="text-center text-md-left mb-4">
                    <img src="@/assets/images/logos/logoweb.png" height="80" alt="logo" />
                    <div class="text-muted">Admin Manage System</div>
                    <div class="text-muted text-caption">Log in to your account</div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field variant="underlined" color="primary" label="Username" append-inner-icon="mdi-account"
                    hide-details v-model="user.user_username"></v-text-field>
                  <v-text-field class="mt-4" type="password" variant="underlined" color="primary" label="Password"
                    append-inner-icon="mdi-lock" hide-details v-model="user.user_password"></v-text-field>
                  <div class="ml-n2 mt-4">
                    <v-checkbox v-model="remember_me" color="primary" hide-details>
                      <template v-slot:label class="text-body-1">จดจำการเข้าใช้งาน</template>
                    </v-checkbox>
                  </div>
                  <div class="mt-4">
                    <v-btn type="submit" color="primary" size="large" block flat rounded>Sign in</v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
      </form>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';

const title = ref("TTCenter");

useHead({
  meta: [{ content: title }],
  titleTemplate: () => {
    return "TTCenter";
  },
});
</script>

<template>
  <v-locale-provider>
    <v-app>
      <LayoutFullMain />
      <v-main>
        <v-container fluid class="page-wrapper">
          <RouterView />
        </v-container>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>

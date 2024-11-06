<script setup lang="ts">
import { RouterView } from "vue-router";

const title = ref("TTCenter");

useHead({
  meta: [{ content: title }],
  titleTemplate: () => {
    return "TTCenter login";
  },
});
</script>
<template>
  <v-app>
    <RouterView />
  </v-app>
</template>

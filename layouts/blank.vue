<script setup lang="ts">
import { RouterView } from "vue-router";

const title = ref("revel-task");

useHead({
  meta: [{ content: title }],
  titleTemplate: () => {
    return "revel-task login";
  },
});
</script>
<template>
  <v-app>
    <RouterView />
  </v-app>
</template>

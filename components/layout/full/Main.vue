<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { Menu2Icon } from 'vue-tabler-icons';

import sidebarItems from '@/components/layout/full/vertical-sidebar/sidebarItem';

import { useNotifyStore } from "@/stores/useNotifyStore";

const { $auth } = useNuxtApp();

const notifyStore = useNotifyStore()

const menuNotiQty = computed(() => Object.keys(notifyStore.menuNoti).length)

const bypass = true

!bypass && sidebarItems.forEach(item => {
  item.childs = item.childs.filter(child => $auth.getPermission(child.key).permission_view)
});

const sidebar_menus = shallowRef(sidebarItems.filter(val => val.childs.length > 0));

const sDrawer = ref(true);

function mapNoti(item: any) {
  if (notifyStore.menuNoti[item.key]) {
    item.chip = notifyStore.menuNoti[item.key]
    item.chipColor = 'error'
  }

  return item
}
</script>

<template>
  <!------Sidebar-------->
  <v-navigation-drawer left elevation="0" app class="leftSidebar" v-model="sDrawer">
    <!---Logo part -->
    <div class="pa-2 ml-n4">
      <LayoutFullLogo />
    </div>
    <perfect-scrollbar class="scrollnavbar">
      <v-list class="py-2 px-4">
        <template v-for="(menu, i) in sidebar_menus" :key="menu.header">
          <LayoutFullVerticalSidebarNavGroup v-if="menu.header" :item="menu" />
          <template v-for="(item) in menu.childs">
            <template v-if="menuNotiQty">
              <LayoutFullVerticalSidebarNavItem :item="mapNoti(item)" class="leftPadding" />
            </template>
            <template v-else>
              <LayoutFullVerticalSidebarNavItem :item="item" class="leftPadding" />
            </template>
          </template>
        </template>
      </v-list>
    </perfect-scrollbar>

  </v-navigation-drawer>
  <!------Header-------->
  <v-app-bar elevation="0" height="70">
    <div class="d-flex align-center justify-space-between w-100">
      <div>
        <v-btn class="ms-md-3 ms-sm-5 ms-3 text-muted" @click="sDrawer = !sDrawer" icon variant="flat" size="small">
          <Menu2Icon size="20" />
        </v-btn>
      </div>
      <div>
        <LayoutFullVerticalHeaderNotificationDD />
        <!-- User Profile -->
        <LayoutFullVerticalHeaderProfileDD />
      </div>
    </div>
  </v-app-bar>
</template>

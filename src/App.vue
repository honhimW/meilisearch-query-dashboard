<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { ScrollArea, ScrollBar } from './components/ui/scroll-area'
import ProfileDialog from '@/ProfileDialog.vue'
import Toaster from '@/components/ui/toast/Toaster.vue'

onMounted(() => {
  useAppStore().initTheme()
  useAppStore().initClient()
})

</script>

<template>
  <ProfileDialog/>
  <ScrollArea class="h-screen">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <ScrollBar class="z-50" />
  </ScrollArea>
  <Toaster />
</template>

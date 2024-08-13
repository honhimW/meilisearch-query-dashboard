<script setup lang="ts">
import GlobalSearchPopover from '@/components/core/GlobalSearchPopover.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import { Menu, MoonStar, Power, PowerOff, Sun } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const store = useAppStore()

const toggleMode = () => {
  store.toggleTheme()
}

const updateExperimentalFeatures = (key: string, enabled: boolean) => {
  if (store.experimentalFeatures) {
    store.experimentalFeatures[key] = enabled
  }
  window.msClient.httpRequest.patch('/experimental-features', store.experimentalFeatures).then(value => {
    store.experimentalFeatures = value
  })
}

</script>

<template>
  <nav
    class="flex items-center justify-between h-[64px] border-b-[1px] px-4 fixed z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border"
    :style="{ width: store.navWidth }">
    <div class="w-24 hidden lg:block">
      <Breadcrumb />
    </div>
    <div class="w-2/5 hidden lg:block">
      <GlobalSearchPopover />
    </div>
    <Button
      variant="outline"
      class="p-[6px] w-8 h-8 transition-all duration-200 block lg:hidden"
      :class="store.sidebarExpanded ? 'bg-transparent' : 'dark:bg-white'"
      @click="store.toggleSidebar()"
    >
      <Menu class="transition-all duration-500 text-black" />
    </Button>
    <div class="flex items-center">
      <Button variant="outline" class="border-0 p-[6px] ml-2 w-8 h-8" @click="toggleMode">
        <Sun v-if="store.isDark" />
        <MoonStar v-else />
      </Button>
      <div class="border-x-[1px] border-gray-300 h-[24px] w-[1px] mx-2"></div>
      <HoverCard>
        <HoverCardTrigger as-child>
          <Button variant="outline" class="border-0 p-[6px] w-8 h-8" @click="store.toggleDialog(true)">
            <Power v-if="store.serverVersion" style="color: deeppink" />
            <Power v-else-if="store.serverUrl" style="color: orangered" />
            <PowerOff v-else style="color: darkred" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent class="w-80">
          <div class="flex justify-between space-x-4">
            <div class="space-y-1">
              <h4 class="text-sm font-semibold">
                {{ store.serverVersion ?? 'Unknown' }}
              </h4>
              <p class="text-sm">
                <a v-if="store.serverUrl" :href="store.serverUrl" target="_blank" class="underline">
                  {{ store.serverUrl }}
                </a>
                <span v-else class="text-sm">
                  {{ 'Not Connected.' }}
                </span>
              </p>
              <Separator/>
              <div class="flex items-center pt-2">
                <span class="text-xs text-muted-foreground">
                  <a href="https://www.meilisearch.com/docs/reference/api/experimental_features" target="_blank">
                    Experimental Features
                  </a>
                </span>
              </div>
              <Label
                v-for="(v, k) in store.experimentalFeatures"
                :key="k"
                html-for="mute"
                class="flex items-center gap-2 text-xs font-normal"
              >
                <Switch :id="k" aria-label="Editable" :checked="v" @update:checked="_bool => updateExperimentalFeatures(k, _bool)" />
                {{ k }}
              </Label>
              <Separator/>
              <div class="flex items-center pt-2">
                <span class="text-xs text-muted-foreground">
                  @honhimw
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  </nav>
</template>

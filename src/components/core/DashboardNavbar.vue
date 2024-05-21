<script setup lang="ts">
import GlobalSearchPopover from '@/components/core/GlobalSearchPopover.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import { Menu, MoonStar, Sun, Zap, ZapOff } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

const store = useAppStore()

const toggleMode = () => {
  store.toggleTheme()
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
      <!--      <Button variant="outline" class="border-0 p-[6px] w-8 h-8">-->
      <!--        <Bell />-->
      <!--      </Button>-->
      <Button variant="outline" class="border-0 p-[6px] ml-2 w-8 h-8" @click="toggleMode">
        <Sun v-if="store.isDark" />
        <MoonStar v-else />
      </Button>
      <div class="border-x-[1px] border-gray-300 h-[24px] w-[1px] mx-2"></div>
      <!--      <TooltipProvider :delay-duration="0">-->
      <!--        <Tooltip>-->
      <!--          <TooltipTrigger as-child>-->
      <!--            <Button variant="outline" class="border-0 p-[6px] w-8 h-8" @click="store.toggleDialog(true)">-->
      <!--              <Zap v-if="store.serverUrl" style="color: deeppink" />-->
      <!--              <ZapOff v-else style="color: darkred" />-->
      <!--            </Button>-->
      <!--          </TooltipTrigger>-->
      <!--          <TooltipContent>-->
      <!--            <div class="flex justify-between space-x-4">-->
      <!--              <div class="space-y-1">-->
      <!--                <div class="flex justify-between">-->
      <!--                  <PartyPopper class="mr-2 h-4 w-4" />-->
      <!--                  <h4 class="text-sm font-semibold">-->
      <!--                    {{ store.serverVersion ?? 'Unknown' }}-->
      <!--                  </h4>-->
      <!--                </div>-->
      <!--                <Separator />-->
      <!--                <div class="flex justify-between">-->
      <!--                  <Link class="mr-2 h-4 w-4" />-->
      <!--                  <a v-if="store.serverUrl" :href="store.serverUrl" target="_blank">-->
      <!--                    {{ store.serverUrl }}-->
      <!--                  </a>-->
      <!--                  <span v-else class="text-sm">-->
      <!--                    {{ 'Not Connected.' }}-->
      <!--                  </span>-->
      <!--                </div>-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </TooltipContent>-->
      <!--        </Tooltip>-->
      <!--      </TooltipProvider>-->
      <HoverCard>
        <HoverCardTrigger as-child>
          <Button variant="outline" class="border-0 p-[6px] w-8 h-8" @click="store.toggleDialog(true)">
            <Zap v-if="store.serverUrl" style="color: deeppink" />
            <ZapOff v-else style="color: darkred" />
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
              <div class="flex items-center pt-2">
                <CalendarDays class="mr-2 h-4 w-4 opacity-70" />
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

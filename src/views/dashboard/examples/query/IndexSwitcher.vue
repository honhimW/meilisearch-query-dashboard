<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Calendar,
  MoreHorizontal,
  Tags,
  RotateCw,
  User,
} from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { getQuery, updateQueries } from '@/stores/app'
import { Input } from '@/components/ui/input'

interface IndexSwitcherProps {
  isCollapsed: boolean
  indexes: Index[]
}

interface Index {
  uid: string
  count: string
}

const emits = defineEmits<{
  (e: 'refresh:indexes', hook: () => void): void
}>()

const props = defineProps<IndexSwitcherProps>()

const selectedIndex = ref<Index | undefined>(props?.indexes[0])

onMounted(() => {
  refresh()
})

watch(() => selectedIndex.value, value => {
  if (value) {
    updateQueries('_index', oldValue => value.uid)
  }
})

const refresh = () => {
  emits('refresh:indexes', () => {
    updateSelectedIndex()
  })
}

const updateSelectedIndex = () => {
  if (selectedIndex.value) {
    selectedIndex.value = props.indexes.find(value => value.uid == selectedIndex?.value?.uid)
  } else if (getQuery('_index')) {
    selectedIndex.value = props.indexes.find(value => value.uid == getQuery('_index'))
  } else if (props.indexes.length > 0) {
    selectedIndex.value = props.indexes[0]
  } else {
    selectedIndex.value = undefined
  }
}

const open = ref(false)

</script>
<template>
  <div class="flex w-full flex-row items-center justify-between rounded-md border px-0.5 py-0">
    <p class="text-sm font-medium leading-none">
      <span class="mr-2 rounded-lg bg-primary px-2 py-1 text-xs text-primary-foreground " v-if="selectedIndex">
        {{ selectedIndex?.uid }}
      </span>
      <span class="text-xs text-muted-foreground">
        {{ selectedIndex?.count }}
      </span>
    </p>
    <DropdownMenu v-model:open="open">
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="sm">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" class="w-[200px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Tags class="mr-2 h-4 w-4" />
              Select Index
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="p-0">
              <Command>
                <CommandInput
                  placeholder="Filter label..."
                  auto-focus
                />
                <CommandList>
                  <CommandEmpty>No label found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      v-for="index in props.indexes"
                      :key="index.uid"
                      :value="index"
                      @select="(ev) => {
                        selectedIndex = index
                        open = false
                      }"
                    >
                      {{ index.uid }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem style="color: #d10065" @click="refresh">
            <RotateCw class="mr-2 h-4 w-4" />
            Refresh
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
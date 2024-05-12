<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import router from '@/router'
import type { LocationQuery } from 'vue-router'
import { getQuery, updateQueries } from '@/stores/app'

interface IndexSwitcherProps {
  isCollapsed: boolean
  indexes: {
    uid: string
    count: string
  }[]
}

const props = defineProps<IndexSwitcherProps>()

onMounted(() => {
  let _index = getQuery('_index')
  if (_index) {
    selectedIndex.value = _index
  }
})

const selectedIndex = ref<string>(props?.indexes[0]?.uid)

const selectedIndexData = computed(() => props.indexes.find(item => item.uid === selectedIndex.value))

watch(() => selectedIndex.value, value => {
  updateQueries('_index', oldValue => value)
  emits('update:index', value)
})

const emits = defineEmits<{
  (e: 'update:index', payload: string): void
}>()
</script>

<template>
  <Select v-model="selectedIndex">
    <SelectTrigger
      aria-label="Select index"
      :class="cn(
        'flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0',
        { 'flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden': isCollapsed },
      )"
    >
      <SelectValue placeholder="Select an account" v-if="selectedIndexData">
        <div class="flex items-center gap-3">
          <span v-if="!isCollapsed">
            {{ selectedIndexData!.uid }}
          </span>
        </div>
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="index of indexes" :key="index.uid" :value="index.uid">
        <div class="flex items-center gap-3 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
          {{ index.uid }}
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</template>

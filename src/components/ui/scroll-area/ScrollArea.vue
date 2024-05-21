<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { ScrollAreaCorner, ScrollAreaRoot, type ScrollAreaRootProps, ScrollAreaViewport, type Slot } from 'radix-vue'
import ScrollBar from './ScrollBar.vue'
import { cn } from '@/lib/utils'

const props = defineProps<ScrollAreaRootProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const emits = defineEmits<{
  (e: 'reach-bottom'): void
}>()

const handleScrollEnd = (e: Event) => {
  let target = e.target
  if (target) {
    let element = target as HTMLElement
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 10) {
      emits('reach-bottom')
    }
  }
}
</script>

<template>
  <ScrollAreaRoot v-bind="delegatedProps" :class="cn('relative overflow-hidden', props.class)">
    <ScrollAreaViewport class="h-full w-full rounded-[inherit]" @scrollend="handleScrollEnd">
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>

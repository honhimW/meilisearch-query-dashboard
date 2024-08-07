<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import draggable from 'vuedraggable'
import { defineComponent, ref, toRef } from 'vue'
import { Separator } from '@/components/ui/separator'
import type { SearchParams } from 'meilisearch/src/types/types'

export interface Attribute {
  title: string
  label?: string
  icon: string
  variant: 'default' | 'ghost'
  fromFieldDistribution: boolean
}

export interface ScreenProps {
  selected: Attribute[]
  unselected: Attribute[]
}

const props = defineProps<ScreenProps>()
defineComponent(draggable)

const selectedRef = toRef(props.selected)
const unselectedRef = toRef(props.unselected)

const onMove = (e: any) => {
}
const onStart = (e: any) => {
  dragging.value = true
}
const onEnd = (e: any) => {
  dragging.value = false
  emits('updateFields', {
    selected: selectedRef.value,
    unselected: unselectedRef.value
  })
}

const dragging = ref(false)

const emits = defineEmits<{
  (e: 'updateFields', payload: ScreenProps): void
}>()

const plus = (attr: Attribute) => {
  unselectedRef.value.splice(unselectedRef.value.indexOf(attr), 1)
  selectedRef.value.push(attr)
  onEnd(undefined)
}

const minus = (attr: Attribute) => {
  selectedRef.value.splice(selectedRef.value.indexOf(attr), 1)
  unselectedRef.value.splice(0, 0, attr)
  onEnd(undefined)
}

</script>

<template>
  <div
    class="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
  >
    <p
      class="uppercase text-xs font-light text-gray-400 mb-2 tracking-widest transition-all duration-300 delay-100"
    >
      {{ 'PROJECTION' }}
    </p>

    <draggable
      :list="selectedRef"
      :disable="false"
      handle=".handle"
      item-key="title"
      group="fieldName"
      class="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2"
      ghost-class="ghost"
      :move="onMove"
      @start="onStart"
      @end="onEnd"
    >
      <template #header v-if="selectedRef.length === 0">
        <div
          :class="cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'justify-start',
          )"
          role="group"
        >
          {{ 'plain document' }}
        </div>
      </template>
      <template #item="{element}">
        <div
          :class="cn(
            buttonVariants({ variant: element.variant, size: 'sm' }),
            element.variant === 'default'
              && 'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white',
            'justify-start',
          )"
        >
          <div @click="minus(element)">
            <Icon icon="lucide:square-minus" class="mr-2 size-4" />
          </div>
          <Icon icon="lucide:menu" class="handle mr-2 size-4 draggable-component" />
          <!--          <Icon :icon="link.icon" class="mr-2 size-4" />-->
          {{ element.title }}
          <span
            v-if="element.label"
            :class="cn(
              'ml-auto',
              element.variant === 'default'
                && 'text-background dark:text-white',
            )"
          >
            {{ element.label }}
          </span>
        </div>
      </template>
    </draggable>

    <Separator />
    <draggable
      :list="unselectedRef"
      :disable="false"
      handle=".handle"
      item-key="title"
      group="fieldName"
      class="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2"
      ghost-class="ghost"
      :move="onMove"
      @start="onStart"
      @end="onEnd"
    >
      <template #item="{element}">
        <div
          :class="cn(
            buttonVariants({ variant: element.variant, size: 'sm' }),
            element.variant === 'default'
              && 'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white',
            'justify-start',
          )"
        >
          <div @click="plus(element)">
            <Icon icon="lucide:square-plus" class="mr-2 size-3.5" />
          </div>
          <Icon icon="lucide:menu" class="handle mr-2 size-4 draggable-component" />
          <!--          <Icon :icon="link.icon" class="mr-2 size-4" />-->
          {{ element.title }}
          <span
            v-if="element.label"
            :class="cn(
              'ml-auto',
              element.variant === 'default'
                && 'text-background dark:text-white',
            )"
          >
            {{ element.label }}
          </span>
        </div>
      </template>
    </draggable>
  </div>
</template>

<style lang="scss" scoped>
.draggable-component {
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
}
</style>
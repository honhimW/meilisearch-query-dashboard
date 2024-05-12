<script lang="ts" setup>
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { onMounted, ref } from 'vue'
import ListItem from '@/views/dashboard/examples/query/ListItem.vue'
import type { Attribute, ScreenProps } from '@/views/dashboard/examples/query/Screen.vue'

export interface MDocument {
  indexUid?: string
  id?: string
  doc: Record<string, any>
  hit: Record<string, any>
  attributes?: ScreenProps
}

interface IndexSettings {
  uid: string
  idField: string
  selectedFields: string[]
}

defineProps<{
  documents: MDocument[]
  indexSettings?: IndexSettings
}>()
const selectedDocument = defineModel<MDocument>('selectedDocument', { required: false })

const emits = defineEmits<{
  (e: 'click-document'): void
  (e: 'reach-bottom'): void
}>()

const onSelectedDocument = (item: MDocument) => {
  selectedDocument.value = item
  emits('click-document')
}

</script>

<template>
    <ScrollArea style="height: 75vh" class=" flex" @reach-bottom="emits('reach-bottom')">
      <div class="flex-1 flex flex-col gap-2 p-4 pt-0">
        <TransitionGroup name="list" appear>
          <div
            v-for="(item, idx) of documents"
            :key="idx"
            :class="cn(
            'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
            selectedDocument === item && 'bg-muted',
          )"
            @click="onSelectedDocument(item)"
          >
            <div class="flex w-full flex-col gap-1">
              <div class="text-xs font-medium">
                {{ item.id }}
              </div>
              <ListItem :row="item.doc" :attributes="item.attributes"></ListItem>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </ScrollArea>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.list-leave-active {
  position: absolute;
}
</style>

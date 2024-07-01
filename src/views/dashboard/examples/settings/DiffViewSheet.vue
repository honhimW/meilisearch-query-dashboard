<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import DiffView from '@/views/dashboard/examples/settings/DiffView.vue'
import { computed, h, ref } from 'vue'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const props = defineProps<{
  currentSettings: string
  monacoEditorValue: string
}>()

const emits = defineEmits<{
  (e: 'confirm'): void
}>()

const isValid = computed<{
  result: boolean
  message: string
}>(oldValue => {
  try {
    JSON.parse(props.monacoEditorValue)
    return {
      result: true,
      message: ''
    }
  } catch (e) {
    return {
      result: false,
      message: (e as Error).message,
    }
  }
})

const doUpdate = () => {
  let check = isValid.value
  if (check.result) {
    emits('confirm')
  } else {
    useToast().toast({
      class: cn(
        'right-0 bottom-0 flex fixed md:max-w-[420px] md:right-4 md:bottom-4'
      ),
      variant: 'warning',
      title: 'JSON settings invalid!',
      description: h('div', {}, [
        h('pre', {}, check.message)
      ]),
      duration: 4000
    })
  }
}


</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button>
        Update
      </Button>
    </SheetTrigger>
    <SheetContent class="flex flex-col justify-between gap-4">
      <SheetHeader class="text-left">
        <SheetTitle>Diff View</SheetTitle>
        <SheetDescription>
          Confirm before updating settings.
        </SheetDescription>
      </SheetHeader>
      <DiffView :current-settings="currentSettings" :monaco-editor-value="monacoEditorValue" />
      <SheetFooter class="flex flex-row justify-between items-center gap-4">
        <div class="flex gap-4" style="color: #e00b0b">
          <div v-if="!isValid?.result" class="flex flex-row justify-between">
            <Icon name="TriangleAlert" />
            <span>
              Invalid JSON!
            </span>
          </div>
        </div>
        <SheetClose as-child>
          <Button type="submit" @click="doUpdate">
            Confirm
          </Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
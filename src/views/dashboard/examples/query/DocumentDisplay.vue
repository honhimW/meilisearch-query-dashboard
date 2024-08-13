<script lang="ts" setup>
import { Archive, ArchiveX, Braces, Clock, CodeXml, PanelRightClose, Trash2, UnfoldVertical } from 'lucide-vue-next'
import { computed, h, onMounted, ref } from 'vue'
import addDays from 'date-fns/addDays'
import addHours from 'date-fns/addHours'
import format from 'date-fns/format'
import nextSaturday from 'date-fns/nextSaturday'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { MDocument } from '@/views/dashboard/examples/query/DocumentList.vue'
import MonacoEditor from '@/views/dashboard/examples/query/MonacoEditor.vue'
import { ThemeChangeEvent } from '@/stores/app'
import ItemTable from '@/views/dashboard/examples/query/ItemTable.vue'
import { editor } from 'monaco-editor'
import IEditorOptions = editor.IEditorOptions
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { MeiliSearchCommunicationError } from 'meilisearch/src/errors/meilisearch-communication-error'
import SpreadDocumentsDrawer from '@/views/dashboard/examples/query/SpreadDocumentsDrawer.vue'

const { toasts } = useToast()

interface MailDisplayProps {
  doc: MDocument | undefined
}

const props = defineProps<MailDisplayProps>()

const emits = defineEmits<{
  (e: 'close-display'): void
}>()

onMounted(() => {
  window.addEventListener('themeChange', ev => {
    let theme = (ev as ThemeChangeEvent).theme
    monacoTheme.value = toMonacoTheme(theme)
  })
  monacoTheme.value = toMonacoTheme(localStorage.getItem('themeMode') as string)
})

const toMonacoTheme = (themeMode: string) => {
  return themeMode === 'dark' ? 'shacdn-ui-dark' : 'shacdn-ui-light'
}

const monacoTheme = ref(toMonacoTheme(localStorage.getItem('themeMode') as string))

const today = new Date()

const displayType = ref('html')

const monacoEditorOptions = ref<IEditorOptions>({
  readOnly: true
})

const updateOptions = (options: IEditorOptions) => {
  monacoEditorOptions.value = {
    ...monacoEditorOptions,
    ...options
  }
}

const editable = (flag: boolean) => {
  let position = []
  let readOnly = !flag
  updateOptions({
    readOnly: readOnly
  })
}

const monacoEditorValue = computed<string>(oldValue => {
  return JSON.stringify(props.doc?.hit, null, 2)
})

const saveDocument = () => {
  if (props.doc?.indexUid) {
    let parse = JSON.parse(monacoEditorValue.value, (key, value) => {
      if (key == '_formatted' || key == '_rankingScore') {
        return undefined
      }
      return value
    })
    window.msClient.index(props.doc.indexUid).updateDocuments(parse)
      .then(value => {
        useToast().toast({
          class: cn(
            'right-0 bottom-0 flex fixed md:max-w-[420px] md:right-4 md:bottom-4'
          ),
          title: 'Update document!',
          description: value.taskUid.toString(),
          duration: 4000
        })
      })
      .catch(reason => {
        let error = reason as MeiliSearchCommunicationError
        useToast().toast({
          class: cn(
            'right-0 bottom-0 flex fixed md:max-w-[420px] md:right-4 md:bottom-4'
          ),
          variant: 'destructive',
          title: `${error.code}`,
          description: error.message,
          duration: 4000
        })
      })
  }
}

const deleteDocument = () => {
  if (props.doc?.indexUid && props.doc?.id) {
    window.msClient.index(props.doc.indexUid).deleteDocument(props.doc.id).then(value => {
      useToast().toast({
        class: cn(
          'right-0 bottom-0 flex fixed md:max-w-[420px] md:right-4 md:bottom-4'
        ),
        variant: 'warning',
        title: 'Delete document!',
        description: h('div', {}, [
          h('pre', {}, `taskUid:  ${value.taskUid.toString()}`),
          h('pre', {}, `indexUid: ${props.doc?.indexUid}`),
          h('pre', {}, `docId:    ${props.doc?.id}`)
        ]),
        duration: 4000
      })
    })
  }
}

</script>

<template>
  <TooltipProvider :delay-duration="0">
    <div class="flex h-full flex-col">
      <div class="flex items-center p-2">
        <div class="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="icon" :disabled="!doc" @click="deleteDocument">
                <Trash2 class="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" class="mx-1 h-6" />
          <Tooltip>
            <TooltipTrigger as-child>
              <SpreadDocumentsDrawer />
            </TooltipTrigger>
            <TooltipContent>Spread</TooltipContent>
          </Tooltip>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <ToggleGroup type="single" v-model="displayType">
            <Tooltip>
              <TooltipTrigger as-child>
                <ToggleGroupItem value="json" aria-label="Toggle bold"
                                 :variant="displayType === 'json' ? 'outline' : 'default'">
                  <Braces class="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>json</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <ToggleGroupItem value="html" aria-label="Toggle italic"
                                 :variant="displayType === 'html' ? 'outline' : 'default'">
                  <CodeXml class="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>html</TooltipContent>
            </Tooltip>
          </ToggleGroup>
        </div>
        <Separator orientation="vertical" class="mx-2 h-6" />
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" @click="emits('close-display')">
              <PanelRightClose class="size-4" />
              <span class="sr-only">PanelRightClose</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>PanelRightClose</TooltipContent>
        </Tooltip>
      </div>
      <Separator />
      <div v-if="doc" class="flex flex-1 flex-col">
        <MonacoEditor
          v-if="displayType === 'json'"
          :theme="monacoTheme"
          :model-value="monacoEditorValue"
          language="json"
          :options="monacoEditorOptions"
          @update:model-value="args => monacoEditorValue = args"
          class="max-w-[100%] max-h-[100%]"
        />
        <ItemTable
          v-if="displayType === 'html'"
          :row="doc.hit"
          class="max-w-[100%] max-h-[100%]"
        />
        <Separator class="mt-auto" />
        <div class="p-4">
          <form>
            <div class="grid gap-4">
              <div class="flex items-center">
                <Label
                  html-for="mute"
                  class="flex items-center gap-2 text-xs font-normal"
                >
                  <Switch id="editable" aria-label="Editable" @update:checked="editable" />
                  Editable
                </Label>
                <Button
                  type="button"
                  size="sm"
                  class="ml-auto"
                  :disabled="monacoEditorOptions.readOnly"
                  @click="saveDocument"
                >
                  Save
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div v-else class="p-8 text-center text-muted-foreground">
        No message selected
      </div>
    </div>
  </TooltipProvider>
</template>

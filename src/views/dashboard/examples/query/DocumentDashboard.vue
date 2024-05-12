<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { refDebounced } from '@vueuse/core'
import { type Attribute, type ScreenProps } from './Screen.vue'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import type { MDocument } from '@/views/dashboard/examples/query/DocumentList.vue'
import type { MultiSearchQuery, SearchParams } from 'meilisearch/src/types/types'
import { type Hit, MeiliSearchError, type MultiSearchResult, type Settings } from 'meilisearch'
import { RotateCw, ArrowLeftToLine } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { getQuery } from '@/stores/app'
import { useToast } from '@/components/ui/toast'
import {
  DocumentDisplay,
  MultiSearchPopover,
  IndexSwitcher,
  DocumentList,
  Screen,
} from './'
import { MeiliSearchCommunicationError } from 'meilisearch/src/errors/meilisearch-communication-error'
import Icon from '@/components/ui/Icon.vue'

interface MailProps {
  defaultLayout?: number[]
  defaultCollapsed?: boolean
}

export interface IndexHolder {
  uid: string
  primaryKey: string | undefined
  count: string
  settings: Settings | undefined
}

const props = withDefaults(defineProps<MailProps>(), {
  defaultCollapsed: false,
  defaultLayout: () => [15, 85, 85]
})

onMounted(() => {
  refreshIndexes()
})

const refreshIndexes = () => {
  window.msClient?.getIndexes({
    offset: 0,
    limit: 2 << 16
  }).then(value => {
    indexes.value.length = 0
    value.results.forEach(index => {
      let primaryKey = index.primaryKey
      let item: IndexHolder = {
        uid: index.uid,
        primaryKey: primaryKey,
        count: '0',
        settings: undefined
      }
      indexes.value.push(item)
      index.getStats().then(stats => item.count = stats.numberOfDocuments.toString())
      index.getSettings().then(settings => item.settings = settings)
    })
  })
}

const indexes = ref<IndexHolder[]>([])

const isCollapsed = ref(props.defaultCollapsed)

const spreadDocument = ref(false)
const spreadScreen = ref(true)
const selectedIndex = ref<string | undefined>(indexes?.value[0]?.uid)

const searchValue = ref('')
const debouncedSearch = refDebounced(searchValue, 250)

const mDocumentList = ref<MDocument[]>([])

const selectedDocument = ref<MDocument | undefined>(undefined)

const selectedDocumentData = computed(() => selectedDocument.value)

const results = ref<Array<Hit>>([])
const mergeResults = ref<Array<MDocument>>([])

const estimatedTotalHits = ref<number>(0)
const processingTimeMs = ref<number>(0)

const latestQuery = ref<SearchParams | string>()
const latestPage = ref<number>(0)

const search = (query?: SearchParams | string, page = 0) => {
  latestQuery.value = query
  latestPage.value = page
  let offset = 20 * page
  let limit = 20 * (page + 1)

  if (page == 0) {
    results.value.length = 0
    mergeResults.value.length = 0
  }
  let index = getQuery('_index')
  if (index) {
    let _searchQuery: MultiSearchQuery
    if (typeof query == 'string') {
      _searchQuery = {
        indexUid: index as string,
        q: query,
        attributesToHighlight: ['*'],
        facets: [],
        highlightPreTag: '<ais-hl-msq-t style="background-color: #ff5895; font-weight: bold">',
        highlightPostTag: '</ais-hl-msq-t>',
        limit: limit,
        offset: offset,
      }
    } else {
      _searchQuery = {
        ...query as SearchParams,
        indexUid: index as string,
        limit: limit,
        offset: offset,
      }
    }
    window.msClient?.multiSearch({
      queries: [_searchQuery]
    }).then(value => {
      let results = value.results
      estimatedTotalHits.value = results[0].estimatedTotalHits ?? 0
      processingTimeMs.value = results[0].processingTimeMs ?? 0
      renderList(results, mergeResults.value, page == 0)
      mDocumentList.value = mergeResults.value
    }).catch(reason => {
      let error = reason as MeiliSearchCommunicationError
      console.log({ error })

      useToast().toast({
        class: cn(
          'right-0 bottom-0 flex fixed md:max-w-[420px] md:right-4 md:bottom-4'
        ),
        variant: 'destructive',
        title: `${error.code}`,
        description: error.message,
        duration: 4000,
      })
    })
  }

}

interface IndexInfo {
  pk: string
  setting: Settings
}

const indexInfo: Record<string, string> = {}

const flattenObject = (obj: any, parentKey = '', result = {} as Record<string, any>) => {
  for (let key in obj) {
    let newKey = parentKey ? `${parentKey}.${key}` : `${key}`
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      flattenObject(obj[key], newKey, result)
    } else {
      result[newKey] = obj[key]
    }
  }
  return result
}

const renderList = (results: Array<MultiSearchResult<Record<string, any>>>, mergeResults: Array<MDocument>, reset = false) => {
  let selected = screenAttributes.value.selected.map(_a => _a.title)
  if (reset) {
    screenKeys.value = []
    screenAttributes.value.selected.length = 0
    screenAttributes.value.unselected.length = 0
  }
  results.forEach(value => {
    let indexUid = value.indexUid
    let _hits = value.hits
    _hits.forEach(hit => {
      let _doc: Record<string, any> = hit._formatted as Record<string, any>
      _doc = flattenObject(_doc)
      for (let key in _doc) {
        let attribute: Attribute = {
          title: key,
          label: '1',
          icon: '',
          variant: 'ghost'
        }
        if (!screenKeys.value.includes(key)) {
          let pk = indexes.value.filter(_idx => _idx.uid === indexUid).map(_idx => _idx.primaryKey).at(0)
          if (pk === key) {
            attribute.variant = 'default'
          }
          screenKeys.value.push(key)
          if (selected.includes(key)) {
            screenAttributes.value.selected.push(attribute)
          } else {
            screenAttributes.value.unselected.push(attribute)
          }
        } else {
          let a: Attribute | undefined = screenAttributes.value.selected.filter(_a => _a.title === key).at(0)
          if (!a) {
            a = screenAttributes.value.unselected.filter(_a => _a.title === key).at(0)
          }
          if (a) {
            a.label = (Number(a.label) + 1).toString()
          }
        }
      }
      mergeResults.push({
        indexUid,
        id: indexInfo[indexUid],
        doc: _doc,
        hit,
        attributes: screenAttributes.value
      })
    })
  })

}

const screenKeys = ref<string[]>([])

const screenAttributes = ref<ScreenProps>({
  selected: [],
  unselected: []
})

function updateAttributes(props: ScreenProps) {
  screenAttributes.value = props
}

function onCollapse() {
  isCollapsed.value = true
}

function onExpand() {
  isCollapsed.value = false
}

const rotate = (event: any) => {
  event.target.classList.add('rotate-animation')
  setTimeout(() => {
    event.target.classList.remove('rotate-animation')
  }, 1000)
  refreshIndexes()
}

</script>

<template>
  <ResizablePanelGroup
    id="resize-panel-group-1"
    direction="horizontal"
    :class="cn(
        'h-full',
        'items-stretch',
        'max-h-[100%]',
      )"
  >
    <ResizablePanel
      id="resize-panel-1"
      v-show="spreadScreen"
      :default-size="defaultLayout[0]"
      :min-size="15"
      :max-size="30"
      :class="cn(isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out')"
      @expand="onExpand"
      @collapse="onCollapse"
    >
      <div :class="cn('flex h-[52px] items-center justify-center', isCollapsed ? 'h-[52px]' : 'px-2')">
        <IndexSwitcher
          :is-collapsed="isCollapsed"
          :indexes="indexes"
          @update:index="payload => {selectedIndex = payload}" />
        <Button variant="ghost" size="icon" @click="rotate">
          <RotateCw class="size-4" />
        </Button>
      </div>
      <Separator />
      <Screen
        :selected="screenAttributes.selected"
        :unselected="screenAttributes.unselected"
        @updateFields="updateAttributes"
      />
    </ResizablePanel>
    <ResizableHandle id="resize-handle-1" with-handle />
    <ResizablePanel id="resize-panel-2" :default-size="defaultLayout[1]" :min-size="30">
      <Tabs default-value="all">
        <div class="p-2">
          <div class="relative flex">
            <Button variant="outline" class="border-0 p-[6px] w-8 h-8" @click="spreadScreen = !spreadScreen">
              <ArrowLeftToLine class="transition-all duration-500"
                               :class="!spreadScreen && 'rotate-180 text-black'" />
            </Button>
            <MultiSearchPopover @performSearch="payload => search(payload, 0)" :indexes="indexes" />
          </div>
        </div>
        <Separator />
        <div class="flex items-start p-4">
          <div class="flex items-start gap-4 text-sm">
            <div class="grid gap-1">
              <div class="font-semibold">
                Hits:
              </div>
            </div>
            <div class="grid gap-1">
              <div class="font-semibold" style="color: #d10065">
                {{ estimatedTotalHits > 10 ? '~' : '' }} {{ estimatedTotalHits.toLocaleString() }}
              </div>
            </div>
            <div class="grid gap-1">
              <div class="font-semibold">
                Time spent:
              </div>
            </div>
            <div class="grid gap-1">
              <div class="font-semibold" style="color: #d10065">
                {{ processingTimeMs }} ms
              </div>
            </div>
          </div>
        </div>
        <Separator />
        <TabsContent value="all" class="m-0 p-4">
          <DocumentList v-model:selected-document="selectedDocument"
                        :documents="mDocumentList"
                        @click-document="spreadDocument = true"
                        @reach-bottom="() => {search(latestQuery, latestPage + 1)}"
          />
        </TabsContent>
      </Tabs>
    </ResizablePanel>
    <ResizableHandle id="resiz-handle-2" with-handle />
    <ResizablePanel v-if="spreadDocument" id="resize-panel-3" :default-size="defaultLayout[2]">
      <DocumentDisplay :doc="selectedDocumentData" @close-display="spreadDocument = false" />
    </ResizablePanel>
  </ResizablePanelGroup>
</template>

<style scoped>
.refreshRotate {

}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotate-animation {
  animation: rotate 1s linear;
}
</style>
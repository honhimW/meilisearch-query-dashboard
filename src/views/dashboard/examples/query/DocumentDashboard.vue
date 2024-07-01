<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import { type Attribute, type ScreenProps } from './Screen.vue'
import { cn, formattedCount, sleep } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import type { MDocument } from '@/views/dashboard/examples/query/DocumentList.vue'
import type { MultiSearchQuery, SearchParams } from 'meilisearch/src/types/types'
import { type Hit, type MultiSearchResult, type Settings } from 'meilisearch'
import { ArrowLeftToLine, LoaderCircle, CircleCheckBig } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { getQuery, updateQueries } from '@/stores/app'
import { useToast } from '@/components/ui/toast'
import { DocumentDisplay, DocumentList, IndexSwitcher, MultiSearchPopover, Screen } from './'
import { MeiliSearchCommunicationError } from 'meilisearch/src/errors/meilisearch-communication-error'

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

const refreshIndexes = (hook: () => void) => {
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
      index.getStats().then(stats => {
        item.count = formattedCount(stats.numberOfDocuments, 1)
        hook()
      })
      index.getSettings().then(settings => item.settings = settings)
    })
  })
}

const indexes = ref<IndexHolder[]>([])

const isCollapsed = ref(props.defaultCollapsed)

const spreadDocument = ref(false)
const spreadScreen = ref(true)

const searchValue = ref('')

const mDocumentList = ref<MDocument[]>([])
const searching = ref<boolean>(false)

const selectedDocument = ref<MDocument | undefined>(undefined)

const selectedDocumentData = computed(() => selectedDocument.value)

const results = ref<Array<Hit>>([])
const mergeResults = ref<Array<MDocument>>([])

const estimatedTotalHits = ref<number>(0)
const processingTimeMs = ref<number>(0)

const latestQuery = ref<SearchParams | string>()
const latestPage = ref<number>(0)

const searchLimit = () => {
  return Number(getQuery('limit') ?? '20')
}

const currentIndex = computed<IndexHolder | undefined>(oldValue => {
  let index = getQuery('indexUid')
  return indexes.value.find(value => value.uid == index)
})

const search = (query?: SearchParams | string, page = 0) => {
  usingSingleSearch(query, page)
  // usingMultiSearch(query, page)
}

const throttleSearch = useThrottleFn(search, 200)

const usingSingleSearch = async (query?: SearchParams | string, page = 0) => {
  latestQuery.value = query
  latestPage.value = page

  let _limit = searchLimit()
  let offset = _limit * page
  let limit = _limit * (page + 1)

  if (page == 0) {
    results.value.length = 0
    mergeResults.value.length = 0
    mDocumentList.value = []
    searching.value = true
  }
  let index = getQuery('indexUid')
  let promise
  if (index) {
    let _searchQuery: SearchParams
    if (typeof query == 'string') {
      _searchQuery = {
        q: query,
        attributesToHighlight: ['*'],
        facets: [],
        highlightPreTag: '<ais-hl-msq-t style="background-color: #ff5895; font-weight: bold">',
        highlightPostTag: '</ais-hl-msq-t>',
        limit: limit,
        offset: offset
      }
    } else {
      _searchQuery = {
        ...query as SearchParams,
        limit: limit,
        offset: offset
      }
    }
    // await sleep(1000)
    promise = window.msClient.index(index).search(null, _searchQuery)
      .then(value => {
        let results = [{
          ...value,
          indexUid: index
        }]
        estimatedTotalHits.value = results[0].estimatedTotalHits ?? 0
        processingTimeMs.value = results[0].processingTimeMs ?? 0
        renderList(results, mergeResults.value, page == 0)
        mDocumentList.value = mergeResults.value
      }).catch(reason => {
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
  } else {
    promise = new Promise((resolve, reject) => reject.apply('indexUid is missing.'))
  }
  promise.finally(() => searching.value = false)
}

const usingMultiSearch = (query?: SearchParams | string, page = 0) => {
  latestQuery.value = query
  latestPage.value = page

  let _limit = searchLimit()
  let offset = _limit * page
  let limit = _limit * (page + 1)

  if (page == 0) {
    results.value.length = 0
    mergeResults.value.length = 0
  }
  let index = getQuery('indexUid')
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
        offset: offset
      }
    } else {
      _searchQuery = {
        ...query as SearchParams,
        indexUid: index as string,
        limit: limit,
        offset: offset
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
            a.label = formattedCount((Number(a.label) + 1))
          }
        }
      }
      mergeResults.push({
        indexUid,
        id: currentIndex.value?.primaryKey ? _doc[currentIndex.value?.primaryKey] : undefined,
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

onMounted(() => {
  let selectedStr = getQuery('_selected')
  if (selectedStr && selectedStr != '') {
    selectedStr.split(',').forEach(value => {
      screenKeys.value.push(value)
      screenAttributes.value.selected.push({
        title: value,
        icon: '',
        variant: 'ghost'
      })
    })
  }
})

function updateAttributes(props: ScreenProps) {
  screenAttributes.value = props
  let _selected = screenAttributes.value.selected
  let selectedStr = _selected.map(value => value.title).join(',')
  updateQueries('_selected', oldValue => selectedStr)
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
          @refresh:indexes="refreshIndexes"
        />
      </div>
      <Separator />
      <Screen
        :selected="screenAttributes.selected"
        :unselected="screenAttributes.unselected"
        @updateFields="updateAttributes"
      />
    </ResizablePanel>
    <ResizableHandle v-show="spreadScreen" id="resize-handle-1" with-handle />
    <ResizablePanel id="resize-panel-2" :default-size="defaultLayout[1]" :min-size="20">
      <Tabs default-value="all">
        <div class="p-2">
          <div class="relative flex">
            <Button variant="outline" class="border-0 p-[6px] w-8 h-8" @click="spreadScreen = !spreadScreen">
              <ArrowLeftToLine class="transition-all duration-500"
                               :class="!spreadScreen && 'rotate-180 text-black'" />
            </Button>
            <MultiSearchPopover @performSearch="payload => throttleSearch(payload, 0)" :indexes="indexes" />
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
            <div class="grid gap-1">
              <LoaderCircle v-if="searching" class="rotate-loader h-5 w-5"/>
              <CircleCheckBig v-else-if="processingTimeMs" class="h-5 w-5"/>
            </div>
          </div>
        </div>
        <Separator />
        <TabsContent value="all" class="m-0 p-4">
          <DocumentList v-model:selected-document="selectedDocument"
                        :documents="mDocumentList"
                        :searching="searching"
                        @click-document="spreadDocument = true"
                        @reach-bottom="() => {search(latestQuery, latestPage + 1)}"
          />
        </TabsContent>
      </Tabs>
    </ResizablePanel>
    <ResizableHandle v-if="spreadDocument" id="resiz-handle-2" with-handle />
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

.rotate-loader {
  animation: rotate 600ms linear infinite;
}
</style>
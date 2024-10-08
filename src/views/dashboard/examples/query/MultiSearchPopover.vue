<script setup lang="ts">
import type { SearchParams } from 'meilisearch/src/types/types'
import MonacoEditor from '@/views/dashboard/examples/query/MonacoEditor.vue'
import * as monaco from 'monaco-editor'
import { type CancellationToken, editor, MarkerSeverity } from 'monaco-editor'
import { computed, onMounted, ref, watch } from 'vue'
import { getQuery, ThemeChangeEvent, updateQueries, useAppStore } from '@/stores/app'
import { useMagicKeys } from '@vueuse/core'
import { allSuggestions } from '@/views/dashboard/examples/query/dsl/suggestions'
import { parse2SearchParam } from '@/views/dashboard/examples/query/dsl/MsDslTransformer'
import type { MsDslError } from '@/lib/MsDslErrorListener'
import { MsDslTokenProvider } from '@/views/dashboard/examples/query/dsl/MsDslTokenProvider'
import type { IndexHolder } from '@/views/dashboard/examples/query/DocumentDashboard.vue'
import type { Settings } from 'meilisearch'
import { SearchCheck, SearchX } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  indexes?: IndexHolder[]
}>()
const emits = defineEmits<{
  (e: 'performSearch', payload?: SearchParams[] | string): void
}>()

const searchStr = ref<string>('')
const editorRef = ref<monaco.editor.IStandaloneCodeEditor>()
const markersRef = ref<editor.IMarkerData[]>()

const keys = useMagicKeys({
  passive: false,
  onEventFired(e) {
    // e.preventDefault()
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault()
    }
    return false
  }
})
const ctrlK = keys['ctrl+k']

watch(ctrlK, (value, oldValue, onCleanup) => {
  if (value) {
    editorRef.value?.focus()
    // nav to search
  }
})

const getSetting = (): Settings | undefined => {
  let settings = undefined
  let index = getQuery('indexUid')
  if (props) {
    let find = (props.indexes as IndexHolder[]).find(value => value.uid === index)
    settings = find?.settings
  }
  return settings
}

const emitSearch = () => {
  try {
    let searchParams = parse2SearchParam(searchStr.value, getSetting())
    emits('performSearch', searchParams.searchParamsArray)
  } catch (e) {
    emits('performSearch', searchStr.value)
  }
}

const performSearch = () => {
  updateQueries('q', o => searchStr.value)
  emitSearch()
}

const customizeEditor = (editor: monaco.editor.IStandaloneCodeEditor) => {
  editorRef.value = editor
  editor.addAction({
    id: 'search_popover',
    label: 'search_popover',
    keybindings: [
      monaco.KeyCode.Enter
    ],
    run(editor: editor.ICodeEditor, ...args: any[]): void | Promise<void> {
      performSearch()
    }
  })
  editor.addAction({
    id: 'suggest',
    label: 'suggest',
    keybindings: [
      monaco.KeyMod.Alt | monaco.KeyCode.Slash
    ],
    run(editor: editor.ICodeEditor, ...args: any[]): void | Promise<void> {
      editor.trigger('keyboard', 'editor.action.triggerSuggest', {})
    }
  })
  editor.addAction({
    id: 'disable_actions',
    label: 'disable_actions',
    keybindings: [
      monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.DownArrow,
      monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.UpArrow,
      monaco.KeyMod.Alt | monaco.KeyCode.DownArrow,
      monaco.KeyMod.Alt | monaco.KeyCode.UpArrow,
      monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow,
      monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.UpArrow
    ],
    run(editor: editor.ICodeEditor, ...args: any[]): void | Promise<void> {
    }
  })

  editor.onDidChangeModelContent(e => {
    updateMarker()
  })
  editor.addAction({
    id: 'copy-as-single-search',
    label: 'Copy As Single Search',
    contextMenuGroupId: '9_cutcopypaste',
    contextMenuOrder: -2,
    run: () => {
      try {
        let searchParams = parse2SearchParam(searchStr.value, getSetting())
        clipboard(JSON.stringify(searchParams.searchParamsArray?.[0], null, 2))
      } catch (e) {
        console.error(e)
      }
    }
  })
  editor.addAction({
    id: 'copy-as-multi-search',
    label: 'Copy As Multi Search',
    contextMenuGroupId: '9_cutcopypaste',
    contextMenuOrder: -1,
    run: () => {
      try {
        let searchParams = parse2SearchParam(searchStr.value, getSetting())
        let searchParamsArrayElement = searchParams.searchParamsArray?.[0]
        let multiSearchParam = {
          ...searchParamsArrayElement,
          indexUid: ':index_uid'
        }
        clipboard(JSON.stringify(multiSearchParam, null, 2))
      } catch (e) {
        console.error(e)
      }
    }
  })
  editor.addAction({
    id: 'copy-as-federation-search',
    label: 'Copy As Federation',
    contextMenuGroupId: '9_cutcopypaste',
    contextMenuOrder: 0,
    run: () => {
      try {
        let index = ':index_uid'
        let searchParams = parse2SearchParam(searchStr.value, getSetting())
        let queries = searchParams.searchParamsArray.map(value => ({
          ...value,
          indexUid: index
        }))
        let federationParams = {
          queries,
          federation: {
            offset: 0,
            limit: 20
          }
        }
        clipboard(JSON.stringify(federationParams, null, 2))
      } catch (e) {
        console.error(e)
      }
    }
  })
}

const clipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}

const updateMarker = () => {
  let { le, pe, settingErrors } = parse2SearchParam(searchStr.value, getSetting())
  let errors: MsDslError[] = []
  if (le.length > 0) {
    le.forEach((error) => errors.push(error))
  }
  if (pe.length > 0) {
    pe.forEach((error) => errors.push(error))
  }
  let markers: editor.IMarkerData[] = []
  if (errors.length > 0) {
    errors.forEach(e => {
      markers.push({
        message: e.message,
        startColumn: e.startColumn,
        endColumn: e.endColumn,
        startLineNumber: e.line,
        endLineNumber: e.line,
        severity: monaco.MarkerSeverity.Error
      })
    })
  }
  if (settingErrors.length > 0) {
    settingErrors.forEach(e => {
      markers.push({
        message: e.message,
        startColumn: e.startColumn,
        endColumn: e.endColumn,
        startLineNumber: e.line,
        endLineNumber: e.line,
        severity: monaco.MarkerSeverity.Warning
      })
    })
  }
  markersRef.value = markers
  monaco.editor.setModelMarkers(editorRef.value?.getModel() as editor.ITextModel, 'msDSL', markers)
}

const updateSearchStr = (str: string) => {
  searchStr.value = str
}

const options: editor.IEditorOptions = {
  fontSize: 13,
  fontWeight: '600',
  lineHeight: 36,
  fontFamily: 'sans-serif',
  wordWrap: 'off',
  lineNumbers: 'off',
  scrollbar: {
    vertical: 'hidden',
    horizontal: 'hidden'
  },
  cursorStyle: 'line',
  contextmenu: true,
  minimap: {
    enabled: false
  },
  readOnly: false,
  automaticLayout: true,
  foldingStrategy: 'indentation',
  renderLineHighlight: 'line',
  selectOnLineNumbers: false,
  scrollBeyondLastLine: false,
  overviewRulerBorder: false,
  autoClosingQuotes: 'always'
}

const jsonCardOptions: editor.IEditorOptions = {
  fontSize: 11,
  fontWeight: '500',
  // lineHeight: 36,
  fontFamily: 'sans-serif',
  wordWrap: 'on',
  lineNumbers: 'off',
  scrollbar: {
    vertical: 'hidden',
    horizontal: 'hidden'
  },
  cursorStyle: 'line',
  contextmenu: false,
  minimap: {
    enabled: false
  },
  readOnly: true,
  automaticLayout: true,
  foldingStrategy: 'indentation',
  renderLineHighlight: 'line',
  selectOnLineNumbers: false,
  scrollBeyondLastLine: false,
  overviewRulerBorder: false,
  autoClosingQuotes: 'always'
}

onMounted(() => {
  let _q = getQuery('q')
  if (_q) {
    searchStr.value = _q
  }
  emitSearch()
  configDSL()
  useAppStore().emitter?.on('index-refreshed', updateMarker)
})

const configDSL = () => {
  let msDSL = 'msDSL'
  if (monaco.languages.getLanguages().findIndex(value => value.id === msDSL) != -1) {
    return
  }
  monaco.languages.register({
    id: msDSL
  })

  monaco.languages.setLanguageConfiguration(msDSL, {
    surroundingPairs: [
      { open: '\'', close: '\'' },
      { open: '"', close: '"' },
      { open: '[', close: ']' }
    ],
    autoClosingPairs: [
      { open: '\'', close: '\'' },
      { open: '"', close: '"' },
      { open: '[', close: ']' }
    ]
  })

  monaco.languages.setTokensProvider(msDSL, new MsDslTokenProvider())

  monaco.languages.registerCompletionItemProvider(msDSL, {
    provideCompletionItems(model: monaco.editor.ITextModel, position: monaco.Position, context: monaco.languages.CompletionContext, token: CancellationToken): monaco.languages.ProviderResult<monaco.languages.CompletionList> {

      return allSuggestions(model, position, getSetting(), getQuery('indexUid')).then(items => {
        return {
          suggestions: items
        }
      })
    }
  })
}

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

const monacoTheme = ref<string>(toMonacoTheme(localStorage.getItem('themeMode') as string))

const hasDslError = computed(oldValue => {
  if (markersRef.value) {
    return markersRef.value?.some(value => value.severity == MarkerSeverity.Error)
  } else {
    return false
  }
})

</script>

<template>
  <Button variant="outline" class="border-0 p-[6px] w-8 h-8" @click="performSearch">
    <SearchCheck v-if="!hasDslError"
                 class="transition-all duration-500" />
    <SearchX v-else
             class="transition-all duration-500" />
  </Button>
  <MonacoEditor
    :theme="monacoTheme"
    :model-value="searchStr"
    style="height: 40px"
    :options="options"
    language="msDSL"
    placeHolder="⌘ K, Tips: q: _, sort: @sort:+|-_, filter: #_:?_, on: @on:_"
    @editor-mounted="customizeEditor"
    @update:model-value="updateSearchStr"
  />
</template>
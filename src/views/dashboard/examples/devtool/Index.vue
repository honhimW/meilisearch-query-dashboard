<script setup lang="ts">
import MonacoEditor from '@/views/dashboard/examples/query/MonacoEditor.vue'
import { onMounted, ref } from 'vue'
import { editor, type IDisposable } from 'monaco-editor'
import * as monaco from 'monaco-editor'


const toMonacoTheme = (themeMode: string) => {
  return themeMode === 'dark' ? 'shacdn-ui-dark' : 'shacdn-ui-light'
}

const monacoTheme = ref(toMonacoTheme(localStorage.getItem('themeMode') as string))

const monacoEditorValue = ref<string>('')

const options: editor.IEditorOptions = {
  fontSize: 13,
  fontFamily: 'sans-serif',
  wordWrap: 'on',
  lineNumbers: 'on',
  scrollbar: {
    vertical: 'hidden',
    horizontal: 'hidden'
  },
  cursorStyle: 'line',
  contextmenu: true,
  minimap: {
    enabled: true
  },
  readOnly: false,
  automaticLayout: true,
  foldingStrategy: 'indentation',
  renderLineHighlight: 'line',
  selectOnLineNumbers: true,
  scrollBeyondLastLine: true,
  overviewRulerBorder: true,
  autoClosingQuotes: 'always'
}

const customizeEditor = (editor: monaco.editor.IStandaloneCodeEditor) => {
}

onMounted(() => {
  
})

</script>

<template>
  <div class="flex flex-1 flex-col h-screen">
    <page-header>Settings</page-header>
    <MonacoEditor
      :theme="monacoTheme"
      :model-value="monacoEditorValue"
      language="javascript"
      :options="options"
      @update:model-value="args => monacoEditorValue = args"
      @editor-mounted="customizeEditor"
      class="max-w-[100%] max-h-[100%]"
    />
  </div>
</template>

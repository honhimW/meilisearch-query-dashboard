<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps<{
  currentSettings: string
  monacoEditorValue: string
}>()

const diffView = ref<HTMLElement>()

onMounted(() => {
  let editorDiv = diffView.value
  if (editorDiv) {
    let diffEditor = monaco.editor.createDiffEditor(editorDiv, {
      readOnly: true,
      automaticLayout: true,
      hideUnchangedRegions: {
        enabled: true,
        minimumLineCount: 5,
        contextLineCount: 5,
        revealLineCount: 5,
      },
      renderSideBySide: true,
      useInlineViewWhenSpaceIsLimited: false,
      scrollBeyondLastLine: false,
    })
    let originalModel = monaco.editor.createModel(props.currentSettings, 'json')
    let modifiedModel = monaco.editor.createModel(props.monacoEditorValue, 'json')
    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel
    })
  }
})

</script>
<template>
  <div ref="diffView" style="height: 80vh"></div>
</template>
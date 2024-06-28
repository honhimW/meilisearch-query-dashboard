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
  console.log(diffView)
  console.log(editorDiv)
  if (editorDiv) {
    console.log(props)
    let diffEditor = monaco.editor.createDiffEditor(editorDiv)
    diffEditor.updateOptions({
      readOnly: true
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
  <div ref="diffView" style="height: 70vh; width: 80vh"></div>
</template>
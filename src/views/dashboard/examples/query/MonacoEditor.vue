<template>
  <div ref="codeEditBox" class="codeEditBox s_ipt" ></div>
</template>
<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { editorProps } from './monacoEditorType'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import * as monaco from 'monaco-editor'
import { editor } from 'monaco-editor'

export default defineComponent({
  name: 'monacoEditor',
  props: editorProps,
  emits: ['update:modelValue', 'change', 'editor-mounted'],
  watch: {},
  setup(props, { emit }) {
    self.MonacoEnvironment = {
      getWorker(_: string, label: string) {
        if (label === 'json') {
          return new jsonWorker()
        }
        if (['css', 'scss', 'less'].includes(label)) {
          return new cssWorker()
        }
        if (['html', 'handlebars', 'razor'].includes(label)) {
          return new htmlWorker()
        }
        if (['typescript', 'javascript'].includes(label)) {
          return new tsWorker()
        }
        return new EditorWorker()
      }
    }
    let editor: editor.IStandaloneCodeEditor
    const codeEditBox = ref()
    const init = () => {
      monaco.editor.defineTheme('shacdn-ui-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#0A0B0F'
        }
      })

      monaco.editor.defineTheme('shacdn-ui-light', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#FFFFFF'
        }
      })

      monaco.editor.addKeybindingRules([
        {
          keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD,
          command: 'editor.action.deleteLines',
          when: 'editorTextFocus',
        }
      ])

      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false
      })
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true
      })
      editor = monaco.editor.create(codeEditBox.value, {
        value: props.modelValue,
        language: props.language,
        theme: props.theme,
        wordWrap: 'on',
        ...props.options
      })
      editor.onDidChangeModelContent(() => {
        const value = editor.getValue()
        emit('update:modelValue', value)
        emit('change', value)
      })
      addKeyBindings(editor)

      if (props.placeHolder && props.placeHolder != '') {
        new PlaceholderContentWidget(props.placeHolder, editor);
      }
      emit('editor-mounted', editor)
    }
    watch(
      () => props.theme,
      newValue => {
        if (editor) {
          const options = editor.getOptions()
          let theme: string = options.get('theme')

          if (newValue !== theme) {
            let newOptions: editor.IEditorOptions = {
              ...options,
              theme: newValue
            }
            editor.updateOptions(newOptions)
          }
        }
      }
    )
    watch(
      () => props.modelValue,
      newValue => {
        if (editor) {
          const value = editor.getValue()
          if (newValue !== value) {
            editor.setValue(newValue)
          }
        }
      }
    )
    watch(
      () => props.options,
      newValue => {
        console.log(newValue)
        editor.updateOptions({

        })
        editor.updateOptions(newValue)
      },
      { deep: true }
    )
    watch(
      () => props.language,
      newValue => {
        monaco.editor.setModelLanguage(editor.getModel()!, newValue)
      }
    )
    onBeforeUnmount(() => {
      editor.dispose()
    })
    onMounted(() => {
      init()
    })
    return { codeEditBox }
  }
})

const addKeyBindings = (editor: editor.IStandaloneCodeEditor) => {
  monaco.editor.addKeybindingRules([
    {
      keybinding: monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.DownArrow,
      command: 'editor.action.copyLinesDownAction',
      when: 'editorTextFocus && !editorReadonly',
    },
    {
      keybinding: monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.UpArrow,
      command: 'editor.action.copyLinesUpAction',
      when: 'editorTextFocus && !editorReadonly',
    },
    {
      keybinding: monaco.KeyMod.Alt | monaco.KeyCode.DownArrow,
      command: 'editor.action.moveLinesDownAction',
      when: 'editorTextFocus && !editorReadonly',
    },
    {
      keybinding: monaco.KeyMod.Alt | monaco.KeyCode.UpArrow,
      command: 'editor.action.moveLinesUpAction',
      when: 'editorTextFocus && !editorReadonly',
    },
    {
      keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD,
      command: 'editor.action.deleteLines',
      when: 'editorTextFocus && !editorReadonly',
    },
    {
      keybinding: monaco.KeyMod.Alt | monaco.KeyCode.Minus,
      command: 'editor.fold',
      when: 'editorFocus',
    },
    {
      keybinding: monaco.KeyMod.Alt | monaco.KeyCode.Equal,
      command: 'editor.unfold',
      when: 'editorFocus',
    },
  ])
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, args => {
    let value = editor.getValue()
    let parse = JSON.parse(value)
    let newValue = JSON.stringify(parse, null, 2)
    editor.setValue(newValue)
  }, 'editorTextFocus && !editorReadonly')
}

/**
 * Represents an placeholder renderer for monaco editor
 * Roughly based on https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/codeEditor/browser/untitledTextEditorHint/untitledTextEditorHint.ts
 */
class PlaceholderContentWidget implements monaco.editor.IContentWidget {
  private static readonly ID = 'editor.widget.placeholderHint';

  private domNode: HTMLElement | undefined;

  constructor(
    private readonly placeholder: string,
    private readonly editor: monaco.editor.ICodeEditor,
  ) {
    // register a listener for editor code changes
    editor.onDidChangeModelContent(() => this.onDidChangeModelContent());
    // ensure that on initial load the placeholder is shown
    this.onDidChangeModelContent();
  }

  private onDidChangeModelContent(): void {
    if (this.editor.getValue() === '') {
      this.editor.addContentWidget(this);
    } else {
      this.editor.removeContentWidget(this);
    }
  }

  getId(): string {
    return PlaceholderContentWidget.ID;
  }

  getDomNode(): HTMLElement {
    if (!this.domNode) {
      this.domNode = document.createElement('div');
      this.domNode.style.width = 'max-content';
      this.domNode.style.pointerEvents = 'none';
      this.domNode.textContent = this.placeholder;
      this.domNode.className = 'text-gray-400';
      this.domNode.style.fontStyle = 'italic';
      this.editor.applyFontInfo(this.domNode);
    }

    return this.domNode;
  }

  getPosition(): monaco.editor.IContentWidgetPosition | null {
    return {
      position: { lineNumber: 1, column: 1 },
      preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
    };
  }

  dispose(): void {
    this.editor.removeContentWidget(this);
  }
}

</script>
<style lang="scss" scoped>
.codeEditBox {
  width: v-bind(width);
  height: v-bind(height);
}
</style>
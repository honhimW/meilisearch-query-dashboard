import { type PropType } from 'vue'
import { editor } from 'monaco-editor'
export type Theme = 'vs' | 'hc-black' | 'vs-dark'
export type FoldingStrategy = 'auto' | 'indentation'
export type RenderLineHighlight = 'all' | 'line' | 'none' | 'gutter'
export interface Options {
  automaticLayout: boolean
  foldingStrategy: FoldingStrategy
  renderLineHighlight: RenderLineHighlight
  selectOnLineNumbers: boolean
  minimap: {
    enabled: boolean
  }
  readOnly: boolean
  fontSize: number
  lineHeight: number
  scrollBeyondLastLine: boolean
  overviewRulerBorder: boolean
}
export const editorProps = {
  modelValue: {
    type: String as PropType<string>,
    default: null,
  },
  width: {
    type: [String, Number] as PropType<string | number>,
    default: '100%',
  },
  height: {
    type: [String, Number] as PropType<string | number>,
    default: '100%',
  },
  language: {
    type: String as PropType<string>,
    default: 'javascript',
  },
  theme: {
    type: String as PropType<string>,
    validator(value: string): boolean {
      return ['vs', 'hc-black', 'vs-dark', 'shacdn-ui-light', 'shacdn-ui-dark'].includes(value)
    },
    // default: 'vs-dark',
  },
  placeHolder: {
    type: String as PropType<string>,
    default: '',
  },
  fileUri: {
    type: String as PropType<string>,
    default: null,
  },
  options: {
    type: Object as PropType<editor.IEditorOptions>,
    default: function () {
      return {
        automaticLayout: true,
        foldingStrategy: 'indentation',
        renderLineHighlight: 'all',
        selectOnLineNumbers: true,
        minimap: {
          enabled: true,
        },
        readOnly: true,
        fontSize: 14,
        scrollBeyondLastLine: false,
        overviewRulerBorder: false,
        autoClosingQuotes: 'always',
      }
    },
  },
}
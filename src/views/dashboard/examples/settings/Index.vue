<script setup lang="ts">
import MonacoEditor from '@/views/dashboard/examples/query/MonacoEditor.vue'
import { h, onMounted, ref } from 'vue'
import * as monaco from 'monaco-editor'
import { editor } from 'monaco-editor'
import { getQuery } from '@/stores/app'
import { Button } from '@/components/ui/button'
import { CirclePlay } from 'lucide-vue-next'
import { ToastAction, useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import router from '@/router'
import DiffViewSheet from '@/views/dashboard/examples/settings/DiffViewSheet.vue'

const toMonacoTheme = (themeMode: string) => {
  return themeMode === 'dark' ? 'shacdn-ui-dark' : 'shacdn-ui-light'
}

const monacoTheme = ref(toMonacoTheme(localStorage.getItem('themeMode') as string))

const monacoEditorValue = ref<string>('')
const currentSettings = ref<string>('')

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
  autoClosingQuotes: 'always',
}

const editorRef = ref<monaco.editor.IStandaloneCodeEditor>()

const customizeEditor = (editor: monaco.editor.IStandaloneCodeEditor) => {
  editorRef.value = editor
}

onMounted(() => {
  let indexUid = getQuery('indexUid')
  let promise: Promise<string[]>
  if (indexUid) {
    promise = window.msClient.index(indexUid).getSettings()
      .then(value => {
        let current = JSON.stringify(value, null, 4)
        monacoEditorValue.value = current
        currentSettings.value = current
      }).then(value => {
        return window.msClient.index(indexUid).getStats()
          .then(value => {
            let fieldDistribution = value.fieldDistribution
            let fields: string[] = []
            for (let fieldDistributionKey in fieldDistribution) {
              fields.push(fieldDistributionKey)
            }
            return fields
          })
      })
  } else {
    monacoEditorValue.value =
      `{

}`
    promise = new Promise<string[]>(resolve => {
      resolve([])
    })
  }
  promise
    .then(fields => updateSchema(fields))
    .catch(() => updateSchema())
})

const updateSchema = (fields = [] as string[]) => {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: true,
    schemas: [{
      uri: 'settings',
      fileMatch: ['settings.json'],
      schema: {
        type: 'object',
        properties: {
          filterableAttributes: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'string'
                },
                {
                  enum: fields
                }
              ]
            }
          },
          distinctAttribute: {
            oneOf: [
              { type: 'string' },
              { type: 'null' }
            ]
          },
          sortableAttributes: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'string'
                },
                {
                  enum: fields
                }
              ]
            }
          },
          searchableAttributes: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'string'
                },
                {
                  enum: fields.concat('*')
                }
              ]
            }
          },
          displayedAttributes: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'string'
                },
                {
                  enum: fields.concat('*')
                }
              ]
            }
          },
          rankingRules: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          stopWords: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          synonyms: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          },
          typoTolerance: {
            type: 'object',
            properties: {
              enabled: {
                type: 'boolean'
              },
              disableOnAttributes: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              disableOnWords: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              minWordSizeForTypos: {
                type: 'object',
                properties: {
                  oneTypo: {
                    type: 'number'
                  },
                  twoTypos: {
                    type: 'number'
                  }
                }
              }
            }
          },
          faceting: {
            type: 'object',
            properties: {
              maxValuesPerFacet: {
                type: 'number'
              },
              sortFacetValuesBy: {
                type: 'object',
                additionalProperties: {
                  enum: ['alpha', 'count']
                }
              }
            }
          },
          pagination: {
            type: 'object',
            properties: {
              maxTotalHits: {
                type: 'number'
              }
            }
          },
          separatorTokens: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          nonSeparatorTokens: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          dictionary: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          proximityPrecision: {
            enum: ['byWord', 'byAttribute']
          },
          embedders: {
            type: 'object',
            additionalProperties: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    source: {
                      const: 'openAi'
                    },
                    model: {
                      type: 'string'
                    },
                    apiKey: {
                      type: 'string'
                    },
                    documentTemplate: {
                      type: 'string'
                    },
                    dimensions: {
                      type: 'number'
                    }
                  },
                  required: ['source']
                },
                {
                  type: 'object',
                  properties: {
                    source: {
                      const: 'huggingFace'
                    },
                    model: {
                      type: 'string'
                    },
                    revision: {
                      type: 'string'
                    },
                    documentTemplate: {
                      type: 'string'
                    }
                  },
                  required: ['source']
                },
                {
                  type: 'object',
                  properties: {
                    source: {
                      const: 'userProvided'
                    },
                    dimensions: {
                      type: 'number'
                    }
                  },
                  required: ['source', 'dimensions']
                }
              ]
            }
          }
        }
      }
    }]
  })
}


const dialogOpened = ref<boolean>(false)

const openDiffView = () => {
  dialogOpened.value = true
}

const updateSettings = () => {
  let settingJson = monacoEditorValue.value
  let indexUid = getQuery('indexUid')
  if (indexUid) {
    window.msClient.index(indexUid).updateSettings(JSON.parse(settingJson))
      .then(value => {
        useToast().toast({
          class: cn(
            'right-0 bottom-0 flex fixed md:max-w-[420px] md:right-4 md:bottom-4'
          ),
          variant: 'warning',
          title: 'Update Settings!',
          description: h('div', {}, [
            h('pre', {}, `taskUid:  ${value.taskUid.toString()}`),
            h('pre', {}, `indexUid: ${indexUid}`)
          ]),
          duration: 4000,
          action: h('div', {
            class: 'flex gap-4'
          }, [
            h(ToastAction, {
              altText: 'Route',
              onClick: () => {
                router.push(`/dashboard/task?uid=${value.taskUid}`)
              }
            }, {
              default: () => 'Details'
            }),
            h(ToastAction, {
              altText: 'Cancel',
              onClick: () => {
                window.msClient.cancelTasks({
                  uids: [value.taskUid]
                })
              }
            }, {
              default: () => 'Cancel'
            })
          ])
        })
      })
  }
}

</script>

<template>
  <div class="flex flex-1 flex-col h-screen gap-5">
    <MonacoEditor
      :theme="monacoTheme"
      :model-value="monacoEditorValue"
      language="json"
      :options="options"
      file-uri="inmemory://settings.json"
      @update:model-value="args => monacoEditorValue = args"
      @editor-mounted="customizeEditor"
      class="max-w-[100%] max-h-[100%]"
      style="height: 80vh"
    />
    <DiffViewSheet
      :current-settings="currentSettings"
      :monaco-editor-value="monacoEditorValue"
      @confirm="updateSettings"
    />
  </div>
</template>

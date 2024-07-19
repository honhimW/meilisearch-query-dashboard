import * as monaco from 'monaco-editor'
import { languages } from 'monaco-editor'
import { parse2SearchParam } from '@/views/dashboard/examples/query/dsl/MsDslTransformer'
import MsDslLexer from '@/lib/MsDslLexer'
import type { Token, TokenStream } from 'antlr4'
import CompletionItemKind = languages.CompletionItemKind
import CompletionItem = languages.CompletionItem
import type { Settings } from 'meilisearch'
import { i } from 'vite/dist/node/types.d-aGj9QkWt'
import { symbol } from 'zod'

export const allSuggestions = async (model: monaco.editor.ITextModel, position: monaco.Position, settings?: Settings, indexUid?: string): Promise<CompletionItem[]> => {
  const lineContent = model.getLineContent(1)
  const parsed = parse2SearchParam(lineContent)

  const tokenStream = parsed.tokenStream

  const items: CompletionItem[] = []
  const column = position.column - 1
  let preToken: Token
  let currentToken: Token
  let tokenIndex = tokenStream.size
  for (let i = tokenStream.size - 1; i >= 0; i--) {
    const token = tokenStream.get(i)
    tokenIndex = i
    if (token.type != -1) {
      if (token.start <= column && column <= token.stop) {
        currentToken = token
      }
      if (token.stop < column) {
        preToken = token
        break
      }
    }
  }

  const positionColumn = position.column

  if (preToken) {
    let preTokenIndex = preToken.tokenIndex
    let preTokenType = MsDslLexer.symbolicNames[preToken.type]
    if (!preTokenType) {
      preTokenType = MsDslLexer.literalNames[preToken.type]
    }

    if ((preTokenType == 'STRING' || preTokenType == 'IDENTIFIER') && preTokenIndex > 0 && !currentToken) {
      if (preToken.stop + 1 == positionColumn - 1) {
        currentToken = preToken
        preToken = tokenStream.get(preTokenIndex - 1)
        preTokenIndex = preToken.tokenIndex
        preTokenType = null
        preTokenType = MsDslLexer.symbolicNames[preToken.type]
        if (!preTokenType) {
          preTokenType = MsDslLexer.literalNames[preToken.type]
        }
      }
    }

    let currentTokenType
    if (currentToken) {
      currentTokenType = MsDslLexer.symbolicNames[currentToken.type]
    }

    const completionItems = await resolveByPreTokens(tokenStream, preTokenIndex, [], position, settings, indexUid)
    if (completionItems) {
      completionItems
        .filter(item => {
          if (currentToken && (currentTokenType == 'STRING' || currentTokenType == 'IDENTIFIER')) {
            const startOffset = currentTokenType == 'STRING' ? currentToken.start + 1 : currentToken.start
            const text = currentToken.getInputStream().getText(startOffset, (positionColumn - 1) - 1)
            const b = item.insertText.startsWith(text)
            if (b) {
              item.range.startColumn = positionColumn - text.length
              item.range.endColumn = (currentToken.stop + 1) + 1
            }
            return b
          } else {
            if (currentToken) {
              const text = currentToken.getInputStream().getText(currentToken.start, (positionColumn - 1) - 1)
              const b = item.insertText.startsWith(text)
              if (b) {
                item.range.startColumn = positionColumn - text.length
                item.range.endColumn = (currentToken.stop + 1) + 1
              }
            }
          }
          return true
        })
        .forEach(completionItem => items.push(completionItem))
    }
  } else {
    items.push(
      {
        kind: CompletionItemKind.Method,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        label: {
          label: '@sort : ',
          detail: '',
          description: 'sort'
        },
        range: {
          startLineNumber: 1,
          startColumn: position.column,
          endLineNumber: 1,
          endColumn: position.column
        },
        insertText: '@sort : ',
        documentation: ''
      },
      {
        kind: CompletionItemKind.Method,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        label: {
          label: '@on : ',
          detail: '',
          description: 'search on'
        },
        range: {
          startLineNumber: 1,
          startColumn: position.column,
          endLineNumber: 1,
          endColumn: position.column
        },
        insertText: '@on : ',
        documentation: ''
      },
      {
        kind: CompletionItemKind.Method,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        label: {
          label: '#',
          detail: '',
          description: 'filter with'
        },
        range: {
          startLineNumber: 1,
          startColumn: position.column,
          endLineNumber: 1,
          endColumn: position.column
        },
        insertText: '#',
        documentation: ''
      }
    )
  }

  return items
}

const resolveByPreTokens = async (tokenStream: TokenStream, prevIndex: number, tokens: string[], position: monaco.Position, settings?: Settings, indexUid?: string): Promise<CompletionItem[]> => {
  if (prevIndex < 0) {
    return undefined
  }
  const prevToken = tokenStream.get(prevIndex)
  let prevTokenType = MsDslLexer.symbolicNames[prevToken.type]
  if (!prevTokenType) {
    prevTokenType = MsDslLexer.literalNames[prevToken.type]
  }
  tokens.unshift(prevTokenType)
  switch (prevTokenType) {
    case '\':\'':
    case 'STRING':
    case 'NUMBER':
    case 'IDENTIFIER':
    case '.':
      return await resolveByPreTokens(tokenStream, prevIndex - 1, tokens, position, settings, indexUid)
    case 'AT_SORT':
    case 'AT_ON':
      break
    case 'ASC':
    case 'DESC':
      break
    case 'HASH':
      break
  }
  const items: CompletionItem[] = []
  if (isTokens(tokens, 'AT_SORT') || isTokens(tokens, 'AT_ON')) {
    items.push({
      kind: CompletionItemKind.Operator,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: {
        label: ' : ',
        detail: '<attribute>',
        description: 'assign'
      },
      range: {
        startLineNumber: 1,
        startColumn: position.column,
        endLineNumber: 1,
        endColumn: position.column
      },
      insertText: ': ',
      documentation: ''
    })
  } else if (isTokens(tokens, 'HASH')) {
    settings?.filterableAttributes?.forEach(filterableAttribute => {
      items.push(
        {
          kind: CompletionItemKind.Property,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          label: {
            label: ' ' + filterableAttribute,
            detail: '',
            description: 'filterable'
          },
          range: {
            startLineNumber: 1,
            startColumn: position.column,
            endLineNumber: 1,
            endColumn: position.column
          },
          insertText: filterableAttribute,
          documentation: ''
        }
      )
    })
  } else if (isTokens(tokens, 'ASC') || isTokens(tokens, 'DESC')) {
    settings?.sortableAttributes?.forEach(sortableAttribute => {
      if (sortableAttribute == '_geo') {
        items.push(
          {
            kind: CompletionItemKind.Property,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            label: {
              label: '_geoPoint',
              detail: '',
              description: 'sortable'
            },
            range: {
              startLineNumber: 1,
              startColumn: position.column,
              endLineNumber: 1,
              endColumn: position.column
            },
            insertText: `'_geoPoint($\{1:0}, $\{2:0})' `,
            documentation: ''
          }
        )
      } else {
        items.push(
          {
            kind: CompletionItemKind.Property,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            label: {
              label: sortableAttribute,
              detail: '',
              description: 'sortable'
            },
            range: {
              startLineNumber: 1,
              startColumn: position.column,
              endLineNumber: 1,
              endColumn: position.column
            },
            insertText: sortableAttribute,
            documentation: ''
          }
        )
      }
    })
  } else if (isTokens(tokens, 'AT_SORT', '\':\'')) {
    items.push(
      {
        kind: CompletionItemKind.Operator,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        label: {
          label: ' -',
          detail: '',
          description: 'desc'
        },
        range: {
          startLineNumber: 1,
          startColumn: position.column,
          endLineNumber: 1,
          endColumn: position.column
        },
        insertText: '-',
        documentation: ''
      },
      {
        kind: CompletionItemKind.Operator,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        label: {
          label: ' +',
          detail: '',
          description: 'asc'
        },
        range: {
          startLineNumber: 1,
          startColumn: position.column,
          endLineNumber: 1,
          endColumn: position.column
        },
        insertText: '+',
        documentation: ''
      },
    )
  } else if (isTokens(tokens, 'AT_ON', '\':\'')) {
    settings?.searchableAttributes?.forEach(searchableAttribute => {
      items.push(
        {
          kind: CompletionItemKind.Property,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          label: {
            label: ' ' + searchableAttribute,
            detail: '',
            description: 'searchable'
          },
          range: {
            startLineNumber: 1,
            startColumn: position.column,
            endLineNumber: 1,
            endColumn: position.column
          },
          insertText: searchableAttribute == '*' ? `'${searchableAttribute}'` : searchableAttribute,
          documentation: ''
        }
      )
    })
  } else if (isTokens(tokens, 'HASH', 'IDENTIFIER', '\':\'') || isTokens(tokens, 'STRING', '\':\'')) {
    const symbols = [
      { label: '=', insert: `= $\{1} ` },
      { label: '!=', insert: `!= $\{1} ` },
      { label: '>', insert: `> $\{1} ` },
      { label: '>=', insert: `>= $\{1} ` },
      { label: '<', insert: `< $\{1} ` },
      { label: '<=', insert: `<= $\{1} ` },
      { label: 'like', insert: `like '%$\{1}%' ` },
      { label: 'raw', insert: `raw '$\{1}' ` },
    ]
    symbols.map(symbol => {
      return {
        kind: CompletionItemKind.Operator,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        label: {
          label: ' ' + symbol.label,
          detail: '',
          description: 'filter'
        },
        range: {
          startLineNumber: 1,
          startColumn: position.column,
          endLineNumber: 1,
          endColumn: position.column
        },
        insertText: symbol.insert,
        documentation: ''
      }
    }).forEach((symbol) => items.push(symbol))
  } else if (isTokens(tokens, 'FILTER_SYMBOLS')) {
    if (indexUid) {
      const attr = tokenStream.get(prevIndex - 2)
      const attrText = attr.text
      if (settings?.filterableAttributes?.includes(attrText)) {
        if (attrText == '_geo') {
          items.push(
            {
              kind: CompletionItemKind.Event,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              label: {
                label: '_geoRadius',
                detail: ' radius',
                description: 'geo'
              },
              range: {
                startLineNumber: 1,
                startColumn: position.column,
                endLineNumber: 1,
                endColumn: position.column
              },
              insertText: `'_geoRadius($\{1:0}, $\{2:0}, $\{3:0})' `,
              documentation: ''
            },
            {
              kind: CompletionItemKind.Event,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              label: {
                label: '_geoBoundingBox',
                detail: ' bounding box',
                description: 'geo'
              },
              range: {
                startLineNumber: 1,
                startColumn: position.column,
                endLineNumber: 1,
                endColumn: position.column
              },
              insertText: `'_geoBoundingBox([$\{1:0}, $\{2:0}], [$\{3:0}, $\{4:0}])' `,
              documentation: ''
            }
          )
        }


        const resp = await window.msClient.index(indexUid).searchForFacetValues({
          facetName: attrText,
        })
        resp.facetHits.forEach(facet => {
          items.push(
            {
              kind: CompletionItemKind.Event,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              label: {
                label: facet.value,
                detail: ` ${facet.count}`,
                description: 'facet'
              },
              range: {
                startLineNumber: 1,
                startColumn: position.column,
                endLineNumber: 1,
                endColumn: position.column
              },
              insertText: facet.value,
              documentation: ''
            }
          )
        })
      }
    }
  } else {
    items.push(
      {
        kind: CompletionItemKind.Method,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        label: {
          label: '@sort : ',
          detail: '',
          description: 'sort'
        },
        range: {
          startLineNumber: 1,
          startColumn: position.column,
          endLineNumber: 1,
          endColumn: position.column
        },
        insertText: '@sort : ',
        documentation: ''
      },
      {
        kind: CompletionItemKind.Method,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        label: {
          label: '@on : ',
          detail: '',
          description: 'search on'
        },
        range: {
          startLineNumber: 1,
          startColumn: position.column,
          endLineNumber: 1,
          endColumn: position.column
        },
        insertText: '@on : ',
        documentation: ''
      },
      {
        kind: CompletionItemKind.Method,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        label: {
          label: '#',
          detail: '',
          description: 'filter with'
        },
        range: {
          startLineNumber: 1,
          startColumn: position.column,
          endLineNumber: 1,
          endColumn: position.column
        },
        insertText: '#',
        documentation: ''
      }
    )
  }
  return items
}

const isTokens = (tokens: string[], ...ts: string[]): boolean => {
  if (tokens.length != ts.length) {
    return false
  }
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] != ts[i]) {
      return false
    }
  }
  return true
}
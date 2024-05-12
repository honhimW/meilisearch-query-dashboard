import * as monaco from 'monaco-editor'
import { languages } from 'monaco-editor'
import { parse2SearchParam } from '@/views/dashboard/examples/query/dsl/MsDslTransformer'
import MsDslLexer from '@/lib/MsDslLexer'
import type { Token, TokenStream } from 'antlr4'
import CompletionItemKind = languages.CompletionItemKind
import CompletionItem = languages.CompletionItem
import type { Settings } from 'meilisearch'
import { i } from 'vite/dist/node/types.d-aGj9QkWt'

export const allSuggestions = (model: monaco.editor.ITextModel, position: monaco.Position, settings?: Settings): CompletionItem[] => {
  let lineContent = model.getLineContent(1)
  let parsed = parse2SearchParam(lineContent)

  let tokenStream = parsed.tokenStream

  let items: CompletionItem[] = []
  let column = position.column - 1
  let preToken: Token
  let currentToken: Token
  let tokenIndex = tokenStream.size
  for (let i = tokenStream.size - 1; i >= 0; i--) {
    let token = tokenStream.get(i)
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

  let positionColumn = position.column

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

    let completionItems = resolveByPreTokens(tokenStream, preTokenIndex, [], position, settings)
    if (completionItems) {
      completionItems
        .filter(item => {
          if (currentToken && (currentTokenType == 'STRING' || currentTokenType == 'IDENTIFIER')) {
            let startOffset = currentTokenType == 'STRING' ? currentToken.start + 1 : currentToken.start
            let text = currentToken.getInputStream().getText(startOffset, (positionColumn - 1) - 1)
            let b = item.insertText.startsWith(text)
            if (b) {
              item.range.startColumn = positionColumn - text.length
              item.range.endColumn = (currentToken.stop + 1) + 1
            }
            return b
          } else {
            if (currentToken) {
              let text = currentToken.getInputStream().getText(currentToken.start, (positionColumn - 1) - 1)
              let b = item.insertText.startsWith(text)
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

const resolveByPreTokens = (tokenStream: TokenStream, prevIndex: number, tokens: string[], position: monaco.Position, settings?: Settings): CompletionItem[] => {
  if (prevIndex < 0) {
    return undefined
  }
  let prevToken = tokenStream.get(prevIndex)
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
      return resolveByPreTokens(tokenStream, prevIndex - 1, tokens, position, settings)
    case 'AT_SORT':
    case 'AT_ON':
      break
    case 'ASC':
    case 'DESC':
      break
    case 'HASH':
      break
  }
  let items: CompletionItem[] = []
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
    })
  } else if (isTokens(tokens, 'AT_SORT', '\':\'')) {
    items.push(
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
      }
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
    let symbols = ['=', '!=', '>', '>=', '<', '<=']
    symbols.map(symbol => {
      return {
        kind: CompletionItemKind.Operator,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        label: {
          label: ' ' + symbol,
          detail: '',
          description: 'filter'
        },
        range: {
          startLineNumber: 1,
          startColumn: position.column,
          endLineNumber: 1,
          endColumn: position.column
        },
        insertText: symbol,
        documentation: ''
      }
    }).forEach((symbol) => items.push(symbol))
  } else if (isTokens(tokens, 'FILTER_SYMBOLS')) {
    // nothing
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

const isTokens = (tokens: string[], ...ts: string): boolean => {
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
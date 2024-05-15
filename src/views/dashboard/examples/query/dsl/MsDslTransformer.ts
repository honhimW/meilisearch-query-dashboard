import type { SearchParams } from 'meilisearch/src/types/types'
import toAST from '@/lib/parser'
import { ContentContext, KeyContext, QueryContentContext, ValueContext } from '@/lib/MsDslParser'
import type { Filter, Settings } from 'meilisearch'
import type { MsDslError } from '@/lib/MsDslErrorListener'
import type { Token } from 'antlr4'
import { TokenStream } from 'antlr4/src/antlr4/TokenStream'
import { ParserRuleContext } from 'antlr4/src/antlr4/context/ParserRuleContext'
import { useAppStore } from '@/stores/app'

export const checkLexer = (input: string): MsDslError[] | undefined => {
  const { lexerErrors } = toAST(input)
  if (lexerErrors) {
    return lexerErrors
  }
}

export const checkParser = (input: string): MsDslError[] | undefined => {
  const { parserErrors } = toAST(input)
  if (parserErrors) {
    return parserErrors
  }
}

export const parse2SearchParam = (input: string, settings?: Settings): {
  sp: SearchParams,
  le: MsDslError[],
  pe: MsDslError[],
  tokenStream: TokenStream,
  settingErrors: MsDslError[],
} => {
  const { ast, tokenStream, lexerErrors, parserErrors } = toAST(input)

  const lineContext = ast.line()
  let contentContexts: ContentContext[] = []
  if (lineContext.single()) {
    contentContexts.push(lineContext.single().content())
  } else if (lineContext.multiple()) {
    contentContexts = lineContext.multiple().content_list()
  }

  const filters: Filter = []
  const sorts: string[] = []
  const ons: string[] = []
  const searchParams: SearchParams = {
    q: '',
    attributesToHighlight: ['*'],
    facets: [],
    highlightPreTag: '<ais-hl-msq-t style="background-color: #ff5895; font-weight: bold">',
    highlightPostTag: '</ais-hl-msq-t>',
    limit: 20,
    offset: 0,
    filter: filters,
    sort: sorts
  }

  if (useAppStore().serverVersion > '1.3') {
    searchParams.showRankingScore = true
    searchParams.attributesToSearchOn = ['*']
  }

  const settingErrors: MsDslError[] = []

  const filterableAttributes: string[] = []
  const sortableAttributes: string[] = []
  const searchableAttributes: string[] = ['*']

  if (settings) {
    settings.filterableAttributes?.forEach(attr => filterableAttributes?.push(attr))
    settings.sortableAttributes?.forEach(attr => sortableAttributes?.push(attr))
    settings.searchableAttributes?.forEach(attr => searchableAttributes?.push(attr))
  }

  try {
    for (const cc of contentContexts) {
      if (cc.filterContent()) {
        const filterContentContext = cc.filterContent()
        const keyContext = filterContentContext.key()
        const symbol = filterContentContext.FILTER_SYMBOLS()
        const valueContext = filterContentContext.value()
        const keyText = getKey(keyContext)
        let symbolText = symbol?.getText()
        let valueText = getValue(valueContext)
        if (keyText && symbolText && valueText) {
          if (!filterableAttributes.includes(keyText) && !filterableAttributes.includes('*')) {
            const token = (keyContext as unknown as ParserRuleContext).start
            settingErrors.push({
              line: 1,
              startColumn: token.start + 1,
              endColumn: token.stop + 1,
              message: `[${keyText}] is not a filterable attribute.`
            })
          }
          if (symbolText == 'like') {
            symbolText = '='
            if ((valueText.startsWith('\'%') && valueText.endsWith('%\'')) ||
              (valueText.startsWith('"%') && valueText.endsWith('%"'))
            ) {
              symbolText = 'CONTAINS'
              valueText = valueText.slice(2, -2)
            } else if (valueText.startsWith('\'%') || valueText.startsWith('"%')) {
              symbolText = 'STARTS WITH'
              valueText = valueText.slice(2, -1)
            } else if (valueText.endsWith('%\'') || valueText.endsWith('%"')) {
              symbolText = 'ENDS WITH'
              valueText = valueText.slice(1, -2)
            }
          }
          filters.push(`${keyText} ${symbolText} ${valueText}`)
        }
      } else if (cc.sortContent()) {
        const sortContentContext = cc.sortContent()
        const asc = sortContentContext.ASC()
        const desc = sortContentContext.DESC()
        const keyContext = sortContentContext.key()
        const keyText = getKey(keyContext)
        if (!sortableAttributes.includes(keyText) && !sortableAttributes.includes('*')) {
          const token = (keyContext as unknown as ParserRuleContext).start
          settingErrors.push({
            line: 1,
            startColumn: token.start + 1,
            endColumn: token.stop + 1,
            message: `[${keyText}] is not a sortable attribute.`
          })
        }
        if (asc) {
          sorts.push(keyText + ':asc')
        } else if (desc) {
          sorts.push(keyText + ':desc')
        }
      } else if (cc.onContent()) {
        const onContentContext = cc.onContent()
        const keyContext = onContentContext.key()
        const key = getKey(keyContext)
        if ('*' != key && !searchableAttributes.includes(key) && !searchableAttributes.includes('*')) {
          const token = (keyContext as unknown as ParserRuleContext).start
          settingErrors.push({
            line: 1,
            startColumn: token.start + 1,
            endColumn: token.stop + 1,
            message: `[${key}] is not a searchable attribute.`
          })
        }
        ons.push(key)
        searchParams.attributesToSearchOn = ons
      } else if (cc.queryContent()) {
        const queryContentContext = cc.queryContent()
        const query = getQuery(queryContentContext)
        if (query) {
          if (searchParams.q == '') {
            searchParams.q = query
          } else {
            searchParams.q = searchParams.q + ' ' + query
          }
        }
      }
    }
  } catch (e) {
    console.log(e.toString())
  }
  return {
    sp: searchParams,
    le: lexerErrors,
    pe: parserErrors,
    tokenStream: tokenStream,
    settingErrors: settingErrors
  }
}

const getKey = (keyContext: KeyContext): string | undefined => {
  let keyText
  if (keyContext.STRING()) {
    keyText = keyContext.STRING().getText()
    if (keyText.startsWith('"')) {
      keyText = keyText.slice(1, -1)
      keyText = keyText.replaceAll('\\"', '"')
    } else if (keyText.startsWith('\'')) {
      keyText = keyText.slice(1, -1)
      keyText = keyText.replaceAll('\\\'', '\'')
    }
  } else if (keyContext.IDENTIFIER_list()) {
    const ids = keyContext.IDENTIFIER_list()
    keyText = ids.map(id => id.getText()).join('.')
  }
  return keyText
}

const getValue = (valueContext: ValueContext): string | undefined => {
  let value
  if (valueContext.STRING()) {
    value = valueContext.STRING().getText()
  } else if (valueContext.IDENTIFIER()) {
    value = valueContext.IDENTIFIER().getText()
  } else if (valueContext.number_()) {
    value = valueContext.number_().NUMBER().getText()
  }
  return value
}

const getQuery = (queryContentContext: QueryContentContext): string | undefined => {
  let query
  if (queryContentContext.STRING()) {
    query = queryContentContext.STRING().getText()
  } else if (queryContentContext.IDENTIFIER()) {
    query = queryContentContext.IDENTIFIER().getText()
  } else if (queryContentContext.number_()) {
    query = queryContentContext.number_().NUMBER().getText()
  }
  return query
}
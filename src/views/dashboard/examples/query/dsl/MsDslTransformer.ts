import type { SearchParams } from 'meilisearch/src/types/types'
import toAST from '@/lib/parser'
import { ContentContext, KeyContext, QueryContentContext, ValueContext } from '@/lib/MsDslParser'
import type { Filter, Settings } from 'meilisearch'
import type { MsDslError } from '@/lib/MsDslErrorListener'
import type { Token } from 'antlr4'
import { TokenStream } from 'antlr4/src/antlr4/TokenStream'
import { ParserRuleContext } from 'antlr4/src/antlr4/context/ParserRuleContext'

export const checkLexer = (input: string): MsDslError[] | undefined => {
  let { lexerErrors } = toAST(input)
  if (lexerErrors) {
    return lexerErrors
  }
}

export const checkParser = (input: string): MsDslError[] | undefined => {
  let { parserErrors } = toAST(input)
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
  let { ast, tokenStream, lexerErrors, parserErrors } = toAST(input)

  let lineContext = ast.line()
  let contentContexts: ContentContext[] = []
  if (lineContext.single()) {
    contentContexts.push(lineContext.single().content())
  } else if (lineContext.multiple()) {
    contentContexts = lineContext.multiple().content_list()
  }

  let filters: Filter = []
  let sorts: string[] = []
  let ons: string[] = []
  let searchParams: SearchParams = {
    q: '',
    attributesToHighlight: ['*'],
    facets: [],
    highlightPreTag: '<ais-hl-msq-t style="background-color: #ff5895; font-weight: bold">',
    highlightPostTag: '</ais-hl-msq-t>',
    limit: 20,
    offset: 0,
    showRankingScore: true,
    filter: filters,
    sort: sorts,
    attributesToSearchOn: ['*'],
  }

  let settingErrors: MsDslError[] = []

  let filterableAttributes: string[] = []
  let sortableAttributes: string[] = []
  let searchableAttributes: string[] = ['*']

  if (settings) {
    settings.filterableAttributes?.forEach(attr => filterableAttributes?.push(attr))
    settings.sortableAttributes?.forEach(attr => sortableAttributes?.push(attr))
    settings.searchableAttributes?.forEach(attr => searchableAttributes?.push(attr))
  }

  try {
    for (let cc of contentContexts) {
      if (cc.filterContent()) {
        let filterContentContext = cc.filterContent()
        let keyContext = filterContentContext.key()
        let symbol = filterContentContext.FILTER_SYMBOLS()
        let valueContext = filterContentContext.value()
        let keyText = getKey(keyContext)
        let symbolText = symbol.getText()
        let valueText = getValue(valueContext)
        if (keyText && symbolText && valueText) {
          if (!filterableAttributes.includes(keyText) && !filterableAttributes.includes('*')) {
            let token = (keyContext as unknown as ParserRuleContext).start
            settingErrors.push({
              line: 1,
              startColumn: token.start + 1,
              endColumn: token.stop + 1,
              message: `[${keyText}] is not a filterable attribute.`,
            })
          }
          filters.push(`${keyText} ${symbolText} ${valueText}`)
        }
      } else if (cc.sortContent()) {
        let sortContentContext = cc.sortContent()
        let asc = sortContentContext.ASC()
        let desc = sortContentContext.DESC()
        let keyContext = sortContentContext.key()
        let keyText = getKey(keyContext)
        if (!sortableAttributes.includes(keyText) && !sortableAttributes.includes('*')) {
          let token = (keyContext as unknown as ParserRuleContext).start
          settingErrors.push({
            line: 1,
            startColumn: token.start + 1,
            endColumn: token.stop + 1,
            message: `[${keyText}] is not a sortable attribute.`,
          })
        }
        if (asc) {
          sorts.push(keyText + ':asc')
        } else if (desc) {
          sorts.push(keyText + ':desc')
        }
      } else if (cc.onContent()) {
        let onContentContext = cc.onContent()
        let keyContext = onContentContext.key()
        let key = getKey(keyContext)
        if ('*' != key && !searchableAttributes.includes(key) && !searchableAttributes.includes('*')) {
          let token = (keyContext as unknown as ParserRuleContext).start
          settingErrors.push({
            line: 1,
            startColumn: token.start + 1,
            endColumn: token.stop + 1,
            message: `[${key}] is not a searchable attribute.`,
          })
        }
        ons.push(key)
        searchParams.attributesToSearchOn = ons
      } else if (cc.queryContent()) {
        let queryContentContext = cc.queryContent()
        let query = getQuery(queryContentContext)
        if (query) {
          searchParams.q = query
        }
      }
    }
  } catch (e) {
  }
  return {
    sp: searchParams,
    le: lexerErrors,
    pe: parserErrors,
    tokenStream: tokenStream,
    settingErrors: settingErrors,
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
    let ids = keyContext.IDENTIFIER_list()
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
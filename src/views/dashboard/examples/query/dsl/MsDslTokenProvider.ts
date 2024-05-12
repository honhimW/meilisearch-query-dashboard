import * as monaco from 'monaco-editor'
import { languages } from 'monaco-editor'
import MsDslParser from '@/lib/MsDslParser'
import MsDslLexer from '@/lib/MsDslLexer'
import { parse2SearchParam } from '@/views/dashboard/examples/query/dsl/MsDslTransformer'
import IToken = languages.IToken

export class MsDslTokenProvider implements monaco.languages.TokensProvider {
  getInitialState(): languages.IState {
    return new State()
  }

  tokenize(line: string, state: languages.IState): languages.ILineTokens {
    let tokenStream = parse2SearchParam(line).tokenStream
    let tokens: IToken[] = []
    for (let i = 0; i < tokenStream.size; i++) {
      let token = tokenStream.get(i)
      if (token.type != -1) {
        let tokenType = MsDslLexer.symbolicNames[token.type] ?? 'WS'
        tokens.push({
          scopes: tokenMap[tokenType],
          startIndex: token.start
        })
      }
    }
    return {
      tokens: tokens,
      endState: new State(),
    }
  }

}

enum Scope {
  KEYWORD = 'keyword',
  NUMBER = 'number',
  STRING = 'string',
  CONSTANT = 'constant',
  TYPE = 'type',
  VARIABLE = 'variable',
  FUNCTION = 'function',
  COMMENT = 'comment',
  OPERATOR = 'operator',
}

const tokenMap = {
  'T__0': '',
  'T__1': '',
	'T__2': '',
	'T__3': '',
	'T__4': '',
	'AT_SORT': Scope.KEYWORD,
  'AT_ON': Scope.KEYWORD,
  'ASC': Scope.CONSTANT,
  'DESC': Scope.CONSTANT,
  'HASH': Scope.KEYWORD,
  'FILTER_SYMBOLS': Scope.CONSTANT,
	'SINGLE_LINE_COMMENT': '',
	'MULTI_LINE_COMMENT': '',
  'LITERAL': '',
	'STRING': Scope.STRING,
	'DOUBLE_QUOTE_CHAR': '',
	'SINGLE_QUOTE_CHAR': '',
	'ESCAPE_SEQUENCE': '',
  'NUMBER': Scope.NUMBER,
	'NUMERIC_LITERAL': Scope.NUMBER,
	'SYMBOL': Scope.CONSTANT,
	'HEX': '',
	'INT': '',
	'EXP': '',
	'IDENTIFIER': Scope.VARIABLE,
  'IDENTIFIER_START': '',
	'IDENTIFIER_PART': '',
	'UNICODE_SEQUENCE': '',
	'WS': '',
}

export class State implements languages.IState {
  clone(): languages.IState {
    return new State()
  }

  equals(other: languages.IState): boolean {
    return other === this
  }

}
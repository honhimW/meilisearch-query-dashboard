import MsDslParser from '@/lib/MsDslParser'
import { CharStreams, CommonTokenStream, type TokenStream } from 'antlr4'
import MsDslLexer from '@/lib/MsDslLexer'
import MsDslErrorListener, { type MsDslError } from '@/lib/MsDslErrorListener'

export default function toAST(code: string): {
  ast: MsDslParser,
  lexer: MsDslLexer,
  lexerErrors: MsDslError[],
  parserErrors: MsDslError[],
  tokenStream: TokenStream,
} {
  let ips = CharStreams.fromString(code)
  let lexer = new MsDslLexer(ips)
  let lexerErrorListener = new MsDslErrorListener()
  lexer.removeErrorListeners()
  lexer.addErrorListener(lexerErrorListener)
  let tokenStream = new CommonTokenStream(lexer)
  let msDslParser = new MsDslParser(tokenStream)
  let parserErrorListener = new MsDslErrorListener()
  msDslParser.removeErrorListeners()
  msDslParser.addErrorListener(parserErrorListener)
  return {
    ast: msDslParser,
    lexer: lexer,
    lexerErrors: lexerErrorListener.getErrors(),
    parserErrors: parserErrorListener.getErrors(),
    tokenStream: msDslParser.getTokenStream(),
  }
}

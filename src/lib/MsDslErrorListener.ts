import {
  ErrorListener,
  DiagnosticErrorListener,
  Recognizer,
  type RecognitionException,
  type TokenStream,
  type CommonTokenStream
} from 'antlr4'

export interface MsDslError {
  line: number
  startColumn: number
  endColumn: number
  message: string
  e?: Error
}



export default class MsDslErrorListener implements ErrorListener<any> {

  private errors: MsDslError[] = []

  syntaxError(recognizer: Recognizer<any>, offendingSymbol: any, line: number, column: number, msg: string, e: RecognitionException | undefined): void {
    let tokenStream: CommonTokenStream = recognizer['_input']
    let startColumn = column + 1
    let endColumn = column + 1
    if (tokenStream) {
      let tokens = tokenStream.tokens
      if (tokens) {
        let _token
        for (let token of tokens) {
          if (token.start <= column && column <= token.stop) {
            _token = token
            break
          }
        }
        if (_token) {
          startColumn = _token.start
          endColumn = _token.stop
        }
      }
    }
    this.errors.push({
      line: line,
      startColumn: startColumn,
      endColumn: endColumn,
      message: msg,
      e: e,
    })

  }

  public getErrors() {
    return this.errors
  }

}
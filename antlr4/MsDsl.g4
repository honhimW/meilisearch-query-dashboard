grammar MsDsl;

line
    : single?
    | multiple
    ;

single
    : content
    ;

multiple
    : content (content)+
    ;

content
    : sortContent | filterContent | onContent | queryContent
    ;

sortContent
    : AT_SORT ':' (ASC | DESC) key
    ;

AT_SORT
    : '@sort'
    ;
ASC: '+';
DESC: '-';

filterContent
    : HASH key ':' FILTER_SYMBOLS value
    ;

HASH: '#';

FILTER_SYMBOLS
    : '='
    | '!='
    | '>'
    | '>='
    | '<'
    | '<='
    | 'like'
    | 'raw'
    | 'q'
    ;

queryContent
    : STRING
    | IDENTIFIER
    | number
    ;

onContent
    : AT_ON ':' key
    ;

AT_ON
    : '@on'
    ;

// primary

key
    : STRING
    | IDENTIFIER
    | LITERAL
    | NUMERIC_LITERAL
    | IDENTIFIER ('.' IDENTIFIER)+
    ;

value
    : STRING
    | IDENTIFIER
    | number
    ;

number
    : SYMBOL? (NUMERIC_LITERAL | NUMBER)
    ;

// Lexer

SINGLE_LINE_COMMENT
    : '//' .*? (EOF) -> skip
    ;

MULTI_LINE_COMMENT
    : '/*' .*? '*/' -> skip
    ;

LITERAL
    : 'true'
    | 'false'
    | 'null'
    ;

STRING
    : '"' DOUBLE_QUOTE_CHAR* '"'
    | '\'' SINGLE_QUOTE_CHAR* '\''
    ;

fragment DOUBLE_QUOTE_CHAR
    : ~["\\\r\n]
    | ESCAPE_SEQUENCE
    ;

fragment SINGLE_QUOTE_CHAR
    : ~['\\\r\n]
    | ESCAPE_SEQUENCE
    ;

fragment ESCAPE_SEQUENCE
    : '\\' (
        | UNICODE_SEQUENCE       // \u1234
        | ['"\\/bfnrtv]          // single escape char
        | ~['"\\bfnrtv0-9xu\r\n] // non escape char
        | '0'                    // \0
        | 'x' HEX HEX            // \x3a
    )
    ;

NUMBER
    : INT ('.' [0-9]*)? EXP? // +1.e2, 1234, 1234.5
    | '.' [0-9]+ EXP?        // -.2e3
    | '0' [xX] HEX+          // 0x12345678
    ;

NUMERIC_LITERAL
    : 'Infinity'
    | 'NaN'
    ;

SYMBOL
    : '+'
    | '-'
    ;

fragment HEX
    : [0-9a-fA-F]
    ;

fragment INT
    : '0'
    | [1-9] [0-9]*
    ;

fragment EXP
    : [Ee] SYMBOL? [0-9]*
    ;

IDENTIFIER
    : IDENTIFIER_START IDENTIFIER_PART*
    ;

fragment IDENTIFIER_START
    : [\p{L}]
    | '$'
    | '_'
    | '\\' UNICODE_SEQUENCE
    ;

fragment IDENTIFIER_PART
    : IDENTIFIER_START
    | [\p{M}]
    | [\p{N}]
    | [\p{Pc}]
    | '\u200C'
    | '\u200D'
    ;

fragment UNICODE_SEQUENCE
    : 'u' HEX HEX HEX HEX
    ;

WS
    : [ \t\n\r\u00A0\uFEFF\u2003]+ -> skip
    ;
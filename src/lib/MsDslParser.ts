// Generated from ./MsDsl.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import MsDslListener from "./MsDslListener.js";
// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class MsDslParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly AT_SORT = 3;
	public static readonly ASC = 4;
	public static readonly DESC = 5;
	public static readonly HASH = 6;
	public static readonly FILTER_SYMBOLS = 7;
	public static readonly AT_ON = 8;
	public static readonly SINGLE_LINE_COMMENT = 9;
	public static readonly MULTI_LINE_COMMENT = 10;
	public static readonly LITERAL = 11;
	public static readonly STRING = 12;
	public static readonly NUMBER = 13;
	public static readonly NUMERIC_LITERAL = 14;
	public static readonly SYMBOL = 15;
	public static readonly IDENTIFIER = 16;
	public static readonly WS = 17;
	public static readonly EOF = Token.EOF;
	public static readonly RULE_line = 0;
	public static readonly RULE_single = 1;
	public static readonly RULE_multiple = 2;
	public static readonly RULE_content = 3;
	public static readonly RULE_sortContent = 4;
	public static readonly RULE_filterContent = 5;
	public static readonly RULE_queryContent = 6;
	public static readonly RULE_onContent = 7;
	public static readonly RULE_key = 8;
	public static readonly RULE_value = 9;
	public static readonly RULE_number = 10;
	public static readonly literalNames: (string | null)[] = [ null, "':'", 
                                                            "'.'", "'@sort'", 
                                                            "'+'", "'-'", 
                                                            "'#'", null, 
                                                            "'@on'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             null, "AT_SORT", 
                                                             "ASC", "DESC", 
                                                             "HASH", "FILTER_SYMBOLS", 
                                                             "AT_ON", "SINGLE_LINE_COMMENT", 
                                                             "MULTI_LINE_COMMENT", 
                                                             "LITERAL", 
                                                             "STRING", "NUMBER", 
                                                             "NUMERIC_LITERAL", 
                                                             "SYMBOL", "IDENTIFIER", 
                                                             "WS" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"line", "single", "multiple", "content", "sortContent", "filterContent", 
		"queryContent", "onContent", "key", "value", "number",
	];
	public get grammarFileName(): string { return "MsDsl.g4"; }
	public get literalNames(): (string | null)[] { return MsDslParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return MsDslParser.symbolicNames; }
	public get ruleNames(): string[] { return MsDslParser.ruleNames; }
	public get serializedATN(): number[] { return MsDslParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, MsDslParser._ATN, MsDslParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public line(): LineContext {
		let localctx: LineContext = new LineContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, MsDslParser.RULE_line);
		let _la: number;
		try {
			this.state = 26;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 1, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 23;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 127304) !== 0)) {
					{
					this.state = 22;
					this.single();
					}
				}

				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 25;
				this.multiple();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public single(): SingleContext {
		let localctx: SingleContext = new SingleContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, MsDslParser.RULE_single);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 28;
			this.content();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public multiple(): MultipleContext {
		let localctx: MultipleContext = new MultipleContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, MsDslParser.RULE_multiple);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 30;
			this.content();
			this.state = 32;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 31;
				this.content();
				}
				}
				this.state = 34;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 127304) !== 0));
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public content(): ContentContext {
		let localctx: ContentContext = new ContentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, MsDslParser.RULE_content);
		try {
			this.state = 40;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 3:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 36;
				this.sortContent();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 37;
				this.filterContent();
				}
				break;
			case 8:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 38;
				this.onContent();
				}
				break;
			case 12:
			case 13:
			case 14:
			case 15:
			case 16:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 39;
				this.queryContent();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public sortContent(): SortContentContext {
		let localctx: SortContentContext = new SortContentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, MsDslParser.RULE_sortContent);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 42;
			this.match(MsDslParser.AT_SORT);
			this.state = 43;
			this.match(MsDslParser.T__0);
			this.state = 44;
			_la = this._input.LA(1);
			if(!(_la===4 || _la===5)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 45;
			this.key();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public filterContent(): FilterContentContext {
		let localctx: FilterContentContext = new FilterContentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, MsDslParser.RULE_filterContent);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 47;
			this.match(MsDslParser.HASH);
			this.state = 48;
			this.key();
			this.state = 49;
			this.match(MsDslParser.T__0);
			this.state = 50;
			this.match(MsDslParser.FILTER_SYMBOLS);
			this.state = 51;
			this.value();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public queryContent(): QueryContentContext {
		let localctx: QueryContentContext = new QueryContentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, MsDslParser.RULE_queryContent);
		try {
			this.state = 56;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 12:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 53;
				this.match(MsDslParser.STRING);
				}
				break;
			case 16:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 54;
				this.match(MsDslParser.IDENTIFIER);
				}
				break;
			case 13:
			case 14:
			case 15:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 55;
				this.number_();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public onContent(): OnContentContext {
		let localctx: OnContentContext = new OnContentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, MsDslParser.RULE_onContent);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 58;
			this.match(MsDslParser.AT_ON);
			this.state = 59;
			this.match(MsDslParser.T__0);
			this.state = 60;
			this.key();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public key(): KeyContext {
		let localctx: KeyContext = new KeyContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, MsDslParser.RULE_key);
		let _la: number;
		try {
			this.state = 73;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 62;
				this.match(MsDslParser.STRING);
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 63;
				this.match(MsDslParser.IDENTIFIER);
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 64;
				this.match(MsDslParser.LITERAL);
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 65;
				this.match(MsDslParser.NUMERIC_LITERAL);
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 66;
				this.match(MsDslParser.IDENTIFIER);
				this.state = 69;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				do {
					{
					{
					this.state = 67;
					this.match(MsDslParser.T__1);
					this.state = 68;
					this.match(MsDslParser.IDENTIFIER);
					}
					}
					this.state = 71;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				} while (_la===2);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public value(): ValueContext {
		let localctx: ValueContext = new ValueContext(this, this._ctx, this.state);
		this.enterRule(localctx, 18, MsDslParser.RULE_value);
		try {
			this.state = 78;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 12:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 75;
				this.match(MsDslParser.STRING);
				}
				break;
			case 16:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 76;
				this.match(MsDslParser.IDENTIFIER);
				}
				break;
			case 13:
			case 14:
			case 15:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 77;
				this.number_();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public number_(): NumberContext {
		let localctx: NumberContext = new NumberContext(this, this._ctx, this.state);
		this.enterRule(localctx, 20, MsDslParser.RULE_number);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 81;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===15) {
				{
				this.state = 80;
				this.match(MsDslParser.SYMBOL);
				}
			}

			this.state = 83;
			_la = this._input.LA(1);
			if(!(_la===13 || _la===14)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public static readonly _serializedATN: number[] = [4,1,17,86,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,1,0,3,0,24,8,0,1,0,3,0,27,8,0,1,1,1,1,1,2,1,2,4,2,33,8,2,11,2,12,
	2,34,1,3,1,3,1,3,1,3,3,3,41,8,3,1,4,1,4,1,4,1,4,1,4,1,5,1,5,1,5,1,5,1,5,
	1,5,1,6,1,6,1,6,3,6,57,8,6,1,7,1,7,1,7,1,7,1,8,1,8,1,8,1,8,1,8,1,8,1,8,
	4,8,70,8,8,11,8,12,8,71,3,8,74,8,8,1,9,1,9,1,9,3,9,79,8,9,1,10,3,10,82,
	8,10,1,10,1,10,1,10,0,0,11,0,2,4,6,8,10,12,14,16,18,20,0,2,1,0,4,5,1,0,
	13,14,90,0,26,1,0,0,0,2,28,1,0,0,0,4,30,1,0,0,0,6,40,1,0,0,0,8,42,1,0,0,
	0,10,47,1,0,0,0,12,56,1,0,0,0,14,58,1,0,0,0,16,73,1,0,0,0,18,78,1,0,0,0,
	20,81,1,0,0,0,22,24,3,2,1,0,23,22,1,0,0,0,23,24,1,0,0,0,24,27,1,0,0,0,25,
	27,3,4,2,0,26,23,1,0,0,0,26,25,1,0,0,0,27,1,1,0,0,0,28,29,3,6,3,0,29,3,
	1,0,0,0,30,32,3,6,3,0,31,33,3,6,3,0,32,31,1,0,0,0,33,34,1,0,0,0,34,32,1,
	0,0,0,34,35,1,0,0,0,35,5,1,0,0,0,36,41,3,8,4,0,37,41,3,10,5,0,38,41,3,14,
	7,0,39,41,3,12,6,0,40,36,1,0,0,0,40,37,1,0,0,0,40,38,1,0,0,0,40,39,1,0,
	0,0,41,7,1,0,0,0,42,43,5,3,0,0,43,44,5,1,0,0,44,45,7,0,0,0,45,46,3,16,8,
	0,46,9,1,0,0,0,47,48,5,6,0,0,48,49,3,16,8,0,49,50,5,1,0,0,50,51,5,7,0,0,
	51,52,3,18,9,0,52,11,1,0,0,0,53,57,5,12,0,0,54,57,5,16,0,0,55,57,3,20,10,
	0,56,53,1,0,0,0,56,54,1,0,0,0,56,55,1,0,0,0,57,13,1,0,0,0,58,59,5,8,0,0,
	59,60,5,1,0,0,60,61,3,16,8,0,61,15,1,0,0,0,62,74,5,12,0,0,63,74,5,16,0,
	0,64,74,5,11,0,0,65,74,5,14,0,0,66,69,5,16,0,0,67,68,5,2,0,0,68,70,5,16,
	0,0,69,67,1,0,0,0,70,71,1,0,0,0,71,69,1,0,0,0,71,72,1,0,0,0,72,74,1,0,0,
	0,73,62,1,0,0,0,73,63,1,0,0,0,73,64,1,0,0,0,73,65,1,0,0,0,73,66,1,0,0,0,
	74,17,1,0,0,0,75,79,5,12,0,0,76,79,5,16,0,0,77,79,3,20,10,0,78,75,1,0,0,
	0,78,76,1,0,0,0,78,77,1,0,0,0,79,19,1,0,0,0,80,82,5,15,0,0,81,80,1,0,0,
	0,81,82,1,0,0,0,82,83,1,0,0,0,83,84,7,1,0,0,84,21,1,0,0,0,9,23,26,34,40,
	56,71,73,78,81];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!MsDslParser.__ATN) {
			MsDslParser.__ATN = new ATNDeserializer().deserialize(MsDslParser._serializedATN);
		}

		return MsDslParser.__ATN;
	}


	static DecisionsToDFA = MsDslParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class LineContext extends ParserRuleContext {
	constructor(parser?: MsDslParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public single(): SingleContext {
		return this.getTypedRuleContext(SingleContext, 0) as SingleContext;
	}
	public multiple(): MultipleContext {
		return this.getTypedRuleContext(MultipleContext, 0) as MultipleContext;
	}
    public get ruleIndex(): number {
    	return MsDslParser.RULE_line;
	}
	public enterRule(listener: MsDslListener): void {
	    if(listener.enterLine) {
	 		listener.enterLine(this);
		}
	}
	public exitRule(listener: MsDslListener): void {
	    if(listener.exitLine) {
	 		listener.exitLine(this);
		}
	}
}


export class SingleContext extends ParserRuleContext {
	constructor(parser?: MsDslParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public content(): ContentContext {
		return this.getTypedRuleContext(ContentContext, 0) as ContentContext;
	}
    public get ruleIndex(): number {
    	return MsDslParser.RULE_single;
	}
	public enterRule(listener: MsDslListener): void {
	    if(listener.enterSingle) {
	 		listener.enterSingle(this);
		}
	}
	public exitRule(listener: MsDslListener): void {
	    if(listener.exitSingle) {
	 		listener.exitSingle(this);
		}
	}
}


export class MultipleContext extends ParserRuleContext {
	constructor(parser?: MsDslParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public content_list(): ContentContext[] {
		return this.getTypedRuleContexts(ContentContext) as ContentContext[];
	}
	public content(i: number): ContentContext {
		return this.getTypedRuleContext(ContentContext, i) as ContentContext;
	}
    public get ruleIndex(): number {
    	return MsDslParser.RULE_multiple;
	}
	public enterRule(listener: MsDslListener): void {
	    if(listener.enterMultiple) {
	 		listener.enterMultiple(this);
		}
	}
	public exitRule(listener: MsDslListener): void {
	    if(listener.exitMultiple) {
	 		listener.exitMultiple(this);
		}
	}
}


export class ContentContext extends ParserRuleContext {
	constructor(parser?: MsDslParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public sortContent(): SortContentContext {
		return this.getTypedRuleContext(SortContentContext, 0) as SortContentContext;
	}
	public filterContent(): FilterContentContext {
		return this.getTypedRuleContext(FilterContentContext, 0) as FilterContentContext;
	}
	public onContent(): OnContentContext {
		return this.getTypedRuleContext(OnContentContext, 0) as OnContentContext;
	}
	public queryContent(): QueryContentContext {
		return this.getTypedRuleContext(QueryContentContext, 0) as QueryContentContext;
	}
    public get ruleIndex(): number {
    	return MsDslParser.RULE_content;
	}
	public enterRule(listener: MsDslListener): void {
	    if(listener.enterContent) {
	 		listener.enterContent(this);
		}
	}
	public exitRule(listener: MsDslListener): void {
	    if(listener.exitContent) {
	 		listener.exitContent(this);
		}
	}
}


export class SortContentContext extends ParserRuleContext {
	constructor(parser?: MsDslParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public AT_SORT(): TerminalNode {
		return this.getToken(MsDslParser.AT_SORT, 0);
	}
	public key(): KeyContext {
		return this.getTypedRuleContext(KeyContext, 0) as KeyContext;
	}
	public ASC(): TerminalNode {
		return this.getToken(MsDslParser.ASC, 0);
	}
	public DESC(): TerminalNode {
		return this.getToken(MsDslParser.DESC, 0);
	}
    public get ruleIndex(): number {
    	return MsDslParser.RULE_sortContent;
	}
	public enterRule(listener: MsDslListener): void {
	    if(listener.enterSortContent) {
	 		listener.enterSortContent(this);
		}
	}
	public exitRule(listener: MsDslListener): void {
	    if(listener.exitSortContent) {
	 		listener.exitSortContent(this);
		}
	}
}


export class FilterContentContext extends ParserRuleContext {
	constructor(parser?: MsDslParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public HASH(): TerminalNode {
		return this.getToken(MsDslParser.HASH, 0);
	}
	public key(): KeyContext {
		return this.getTypedRuleContext(KeyContext, 0) as KeyContext;
	}
	public FILTER_SYMBOLS(): TerminalNode {
		return this.getToken(MsDslParser.FILTER_SYMBOLS, 0);
	}
	public value(): ValueContext {
		return this.getTypedRuleContext(ValueContext, 0) as ValueContext;
	}
    public get ruleIndex(): number {
    	return MsDslParser.RULE_filterContent;
	}
	public enterRule(listener: MsDslListener): void {
	    if(listener.enterFilterContent) {
	 		listener.enterFilterContent(this);
		}
	}
	public exitRule(listener: MsDslListener): void {
	    if(listener.exitFilterContent) {
	 		listener.exitFilterContent(this);
		}
	}
}


export class QueryContentContext extends ParserRuleContext {
	constructor(parser?: MsDslParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public STRING(): TerminalNode {
		return this.getToken(MsDslParser.STRING, 0);
	}
	public IDENTIFIER(): TerminalNode {
		return this.getToken(MsDslParser.IDENTIFIER, 0);
	}
	public number_(): NumberContext {
		return this.getTypedRuleContext(NumberContext, 0) as NumberContext;
	}
    public get ruleIndex(): number {
    	return MsDslParser.RULE_queryContent;
	}
	public enterRule(listener: MsDslListener): void {
	    if(listener.enterQueryContent) {
	 		listener.enterQueryContent(this);
		}
	}
	public exitRule(listener: MsDslListener): void {
	    if(listener.exitQueryContent) {
	 		listener.exitQueryContent(this);
		}
	}
}


export class OnContentContext extends ParserRuleContext {
	constructor(parser?: MsDslParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public AT_ON(): TerminalNode {
		return this.getToken(MsDslParser.AT_ON, 0);
	}
	public key(): KeyContext {
		return this.getTypedRuleContext(KeyContext, 0) as KeyContext;
	}
    public get ruleIndex(): number {
    	return MsDslParser.RULE_onContent;
	}
	public enterRule(listener: MsDslListener): void {
	    if(listener.enterOnContent) {
	 		listener.enterOnContent(this);
		}
	}
	public exitRule(listener: MsDslListener): void {
	    if(listener.exitOnContent) {
	 		listener.exitOnContent(this);
		}
	}
}


export class KeyContext extends ParserRuleContext {
	constructor(parser?: MsDslParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public STRING(): TerminalNode {
		return this.getToken(MsDslParser.STRING, 0);
	}
	public IDENTIFIER_list(): TerminalNode[] {
	    	return this.getTokens(MsDslParser.IDENTIFIER);
	}
	public IDENTIFIER(i: number): TerminalNode {
		return this.getToken(MsDslParser.IDENTIFIER, i);
	}
	public LITERAL(): TerminalNode {
		return this.getToken(MsDslParser.LITERAL, 0);
	}
	public NUMERIC_LITERAL(): TerminalNode {
		return this.getToken(MsDslParser.NUMERIC_LITERAL, 0);
	}
    public get ruleIndex(): number {
    	return MsDslParser.RULE_key;
	}
	public enterRule(listener: MsDslListener): void {
	    if(listener.enterKey) {
	 		listener.enterKey(this);
		}
	}
	public exitRule(listener: MsDslListener): void {
	    if(listener.exitKey) {
	 		listener.exitKey(this);
		}
	}
}


export class ValueContext extends ParserRuleContext {
	constructor(parser?: MsDslParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public STRING(): TerminalNode {
		return this.getToken(MsDslParser.STRING, 0);
	}
	public IDENTIFIER(): TerminalNode {
		return this.getToken(MsDslParser.IDENTIFIER, 0);
	}
	public number_(): NumberContext {
		return this.getTypedRuleContext(NumberContext, 0) as NumberContext;
	}
    public get ruleIndex(): number {
    	return MsDslParser.RULE_value;
	}
	public enterRule(listener: MsDslListener): void {
	    if(listener.enterValue) {
	 		listener.enterValue(this);
		}
	}
	public exitRule(listener: MsDslListener): void {
	    if(listener.exitValue) {
	 		listener.exitValue(this);
		}
	}
}


export class NumberContext extends ParserRuleContext {
	constructor(parser?: MsDslParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NUMERIC_LITERAL(): TerminalNode {
		return this.getToken(MsDslParser.NUMERIC_LITERAL, 0);
	}
	public NUMBER(): TerminalNode {
		return this.getToken(MsDslParser.NUMBER, 0);
	}
	public SYMBOL(): TerminalNode {
		return this.getToken(MsDslParser.SYMBOL, 0);
	}
    public get ruleIndex(): number {
    	return MsDslParser.RULE_number;
	}
	public enterRule(listener: MsDslListener): void {
	    if(listener.enterNumber) {
	 		listener.enterNumber(this);
		}
	}
	public exitRule(listener: MsDslListener): void {
	    if(listener.exitNumber) {
	 		listener.exitNumber(this);
		}
	}
}

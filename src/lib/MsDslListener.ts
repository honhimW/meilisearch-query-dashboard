// Generated from ./MsDsl.g4 by ANTLR 4.13.1

import {ParseTreeListener} from "antlr4";


import { LineContext } from "./MsDslParser";
import { SingleContext } from "./MsDslParser";
import { MultipleContext } from "./MsDslParser";
import { ContentContext } from "./MsDslParser";
import { SortContentContext } from "./MsDslParser";
import { FilterContentContext } from "./MsDslParser";
import { QueryContentContext } from "./MsDslParser";
import { OnContentContext } from "./MsDslParser";
import { KeyContext } from "./MsDslParser";
import { ValueContext } from "./MsDslParser";
import { NumberContext } from "./MsDslParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `MsDslParser`.
 */
export default class MsDslListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `MsDslParser.line`.
	 * @param ctx the parse tree
	 */
	enterLine?: (ctx: LineContext) => void;
	/**
	 * Exit a parse tree produced by `MsDslParser.line`.
	 * @param ctx the parse tree
	 */
	exitLine?: (ctx: LineContext) => void;
	/**
	 * Enter a parse tree produced by `MsDslParser.single`.
	 * @param ctx the parse tree
	 */
	enterSingle?: (ctx: SingleContext) => void;
	/**
	 * Exit a parse tree produced by `MsDslParser.single`.
	 * @param ctx the parse tree
	 */
	exitSingle?: (ctx: SingleContext) => void;
	/**
	 * Enter a parse tree produced by `MsDslParser.multiple`.
	 * @param ctx the parse tree
	 */
	enterMultiple?: (ctx: MultipleContext) => void;
	/**
	 * Exit a parse tree produced by `MsDslParser.multiple`.
	 * @param ctx the parse tree
	 */
	exitMultiple?: (ctx: MultipleContext) => void;
	/**
	 * Enter a parse tree produced by `MsDslParser.content`.
	 * @param ctx the parse tree
	 */
	enterContent?: (ctx: ContentContext) => void;
	/**
	 * Exit a parse tree produced by `MsDslParser.content`.
	 * @param ctx the parse tree
	 */
	exitContent?: (ctx: ContentContext) => void;
	/**
	 * Enter a parse tree produced by `MsDslParser.sortContent`.
	 * @param ctx the parse tree
	 */
	enterSortContent?: (ctx: SortContentContext) => void;
	/**
	 * Exit a parse tree produced by `MsDslParser.sortContent`.
	 * @param ctx the parse tree
	 */
	exitSortContent?: (ctx: SortContentContext) => void;
	/**
	 * Enter a parse tree produced by `MsDslParser.filterContent`.
	 * @param ctx the parse tree
	 */
	enterFilterContent?: (ctx: FilterContentContext) => void;
	/**
	 * Exit a parse tree produced by `MsDslParser.filterContent`.
	 * @param ctx the parse tree
	 */
	exitFilterContent?: (ctx: FilterContentContext) => void;
	/**
	 * Enter a parse tree produced by `MsDslParser.queryContent`.
	 * @param ctx the parse tree
	 */
	enterQueryContent?: (ctx: QueryContentContext) => void;
	/**
	 * Exit a parse tree produced by `MsDslParser.queryContent`.
	 * @param ctx the parse tree
	 */
	exitQueryContent?: (ctx: QueryContentContext) => void;
	/**
	 * Enter a parse tree produced by `MsDslParser.onContent`.
	 * @param ctx the parse tree
	 */
	enterOnContent?: (ctx: OnContentContext) => void;
	/**
	 * Exit a parse tree produced by `MsDslParser.onContent`.
	 * @param ctx the parse tree
	 */
	exitOnContent?: (ctx: OnContentContext) => void;
	/**
	 * Enter a parse tree produced by `MsDslParser.key`.
	 * @param ctx the parse tree
	 */
	enterKey?: (ctx: KeyContext) => void;
	/**
	 * Exit a parse tree produced by `MsDslParser.key`.
	 * @param ctx the parse tree
	 */
	exitKey?: (ctx: KeyContext) => void;
	/**
	 * Enter a parse tree produced by `MsDslParser.value`.
	 * @param ctx the parse tree
	 */
	enterValue?: (ctx: ValueContext) => void;
	/**
	 * Exit a parse tree produced by `MsDslParser.value`.
	 * @param ctx the parse tree
	 */
	exitValue?: (ctx: ValueContext) => void;
	/**
	 * Enter a parse tree produced by `MsDslParser.number`.
	 * @param ctx the parse tree
	 */
	enterNumber?: (ctx: NumberContext) => void;
	/**
	 * Exit a parse tree produced by `MsDslParser.number`.
	 * @param ctx the parse tree
	 */
	exitNumber?: (ctx: NumberContext) => void;
}


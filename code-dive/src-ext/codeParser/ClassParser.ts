import * as fs from 'fs';
import * as path from 'path';
import { ParsedTypes } from '../codeModel/ParsedTypes';
var jison = require('jison');

var cSharpGrammarFile = path.resolve(__dirname, "..\\jison\\csharp-grammar.jison");
var bnf = fs.readFileSync(cSharpGrammarFile, "utf8");
var parser = new jison.Parser(bnf);

export function parseSourceCode(sourceCode: string):ParsedTypes {
    var parsedTypes: ParsedTypes = parser.parse(sourceCode);
    return parsedTypes;
}

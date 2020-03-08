import * as fs from 'fs';
import * as path from 'path';
var jison = require('jison');

var cSharpGrammarFile = path.resolve(__dirname, "..\\jison\\csharp-grammar.jison");
var bnf = fs.readFileSync(cSharpGrammarFile, "utf8");
var parser = new jison.Parser(bnf);

export function parseClass(sourceCode: string): string {
    return parser.parse(sourceCode);
}

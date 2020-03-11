var fs = require('fs');
var path = require('path');
var jison = require('jison');

var cSharpGrammarFile = path.resolve(__dirname, "../jison/csharp-grammar.jison");
var bnf = fs.readFileSync(cSharpGrammarFile, "utf8");
var parser = new jison.Parser(bnf);

var sourceFile = path.resolve(__dirname, "../csharp-source-code/source.cs");
var sourceCode = fs.readFileSync(sourceFile, "utf8");

function parseClass(sourceCode) {
    return parser.parse(sourceCode);
}

console.log(parseClass(sourceCode));
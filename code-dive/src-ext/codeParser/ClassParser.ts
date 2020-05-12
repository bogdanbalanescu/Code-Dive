import * as fs from 'fs';
import * as path from 'path';
import { ParsedTypes } from '../codeModel/ParsedTypes';
import { Class } from '../codeModel/Types/Class';
import { Struct } from '../codeModel/Types/Struct';
import { Interface } from '../codeModel/Types/Interface';
import { Enum } from '../codeModel/Types/Enum';
var jison = require('jison');

var cSharpGrammarFile = path.resolve(__dirname, "..\\jison\\csharp-grammar.jison");
var bnf = fs.readFileSync(cSharpGrammarFile, "utf8");
var parser = new jison.Parser(bnf);

export function parseSourceCode(sourceCode: string, sourceFilePath: string): ParsedTypes {
    var parsedTypesResult: ParsedTypes = parser.parse(sourceCode);
    var parsedTypes: ParsedTypes = new ParsedTypes(
        parsedTypesResult.classes.map(type => new Class(type as Class)),
        parsedTypesResult.structs.map(type => new Struct(type as Struct)),
        parsedTypesResult.interfaces.map(type => new Interface(type as Interface)),
        parsedTypesResult.enums.map(type => new Enum(type as Enum)));
    parsedTypes.setSourceFilePath(sourceFilePath);
    return parsedTypes;
}

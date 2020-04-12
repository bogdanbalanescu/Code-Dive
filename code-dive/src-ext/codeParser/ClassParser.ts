import { IType } from '../codeModel/Types/IType';
import { Class } from '../codeModel/Types/Class';
import { Struct } from '../codeModel/Types/Struct';
import { Interface } from '../codeModel/Types/Interface';
import { Enum } from '../codeModel/Types/Enum';
import * as fs from 'fs';
import * as path from 'path';
var jison = require('jison');

var cSharpGrammarFile = path.resolve(__dirname, "..\\jison\\csharp-grammar.jison");
var bnf = fs.readFileSync(cSharpGrammarFile, "utf8");
var parser = new jison.Parser(bnf);

export function parseSourceCode(sourceCode: string): IType[] {
    var parsedSourceCode = parser.parse(sourceCode);
    var types: IType[] = [];
    parsedSourceCode.classes.forEach((parsedClass: any) => {
        types.push(parsedClass as Class);
    });
    parsedSourceCode.structs.forEach((parsedStruct: any) => {
        types.push(parsedStruct as Struct);
    });
    parsedSourceCode.interfaces.forEach((parsedInterface: any) => {
        types.push(parsedInterface as Interface);
    });
    parsedSourceCode.enums.forEach((parsedEnum: any) => {
        types.push(parsedEnum as Enum);
    });
    return types;
}

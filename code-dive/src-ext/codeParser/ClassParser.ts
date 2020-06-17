import { ParsedTypes } from '../codeModel/ParsedTypes';
import { Class } from '../codeModel/Types/Class';
import { Struct } from '../codeModel/Types/Struct';
import { Interface } from '../codeModel/Types/Interface';
import { Enum } from '../codeModel/Types/Enum';

const parserModule = require('./CSharpGrammarParser.js');

export function parseSourceCode(sourceCode: string, sourceFilePath: string): ParsedTypes {
    var parser = new parserModule.Parser();
    var parsedTypesResult: ParsedTypes = parser.parse(sourceCode);
    var parsedTypes: ParsedTypes = new ParsedTypes(
        parsedTypesResult.classes.map(type => new Class(type as Class)),
        parsedTypesResult.structs.map(type => new Struct(type as Struct)),
        parsedTypesResult.interfaces.map(type => new Interface(type as Interface)),
        parsedTypesResult.enums.map(type => new Enum(type as Enum)));
    parsedTypes.setSourceFilePath(sourceFilePath);
    parsedTypes.setIsUpdateToDate(true);
    return parsedTypes;
}

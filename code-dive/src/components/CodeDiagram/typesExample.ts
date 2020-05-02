import { ParsedTypes } from "../../codeModel/ParsedTypes";
import { IType } from "../../codeModel/Types/IType";
import { Class } from "../../codeModel/Types/Class";
import { Struct } from "../../codeModel/Types/Struct";
import { Interface } from "../../codeModel/Types/Interface";
import { Enum } from "../../codeModel/Types/Enum";

var parsedTypes: ParsedTypes = 
    JSON.parse("{\"classes\":[{\"constructors\":[{\"declaredVariables\":[],\"modifiers\":[],\"name\":\"MagicTrick\",\"parameters\":[{\"modifier\":\"\",\"name\":\"name\",\"type\":\"string\"}],\"statements\":[{\"statementText\":\"Name = name;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[\"Name\",\"name\"],\"usedMethods\":[]}]}],\"fields\":[{\"modifiers\":[\"private\"],\"name\":\"secret\",\"type\":\"string\"}],\"methods\":[{\"declaredVariables\":[{\"name\":\"math\",\"type\":\"Math\"}],\"modifiers\":[\"public\"],\"name\":\"ApplyMagic\",\"parameters\":[{\"modifier\":\"\",\"name\":\"x\",\"type\":\"int\"}],\"statements\":[{\"statementText\":\"Math math;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[],\"usedMethods\":[]},{\"statementText\":\"math = new Math();\",\"usedConstructors\":[\"Math\"],\"usedFieldsAndProperties\":[\"math\"],\"usedMethods\":[]},{\"statementText\":\"return x * math.MagicNumber;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[\"x\",\"math.MagicNumber\"],\"usedMethods\":[]}],\"type\":\"int\"}],\"modifiers\":[\"public\"],\"name\":\"MagicTrick\",\"namespace\":\"FruitDelivery\",\"namespaceDependecies\":[\"System\",\"System.Collections.Generic\",\"System.Linq\",\"System.Text\",\"System.Threading.Tasks\"],\"parentInheritances\":[\"Math\"],\"properties\":[{\"accessors\":[{\"body\":[],\"declaredVariables\":[],\"type\":\"get\"},{\"body\":[],\"declaredVariables\":[],\"type\":\"set\"}],\"modifiers\":[\"public\"],\"name\":\"Name\",\"type\":\"string\"}]},{\"constructors\":[],\"fields\":[],\"methods\":[{\"declaredVariables\":[{\"name\":\"sum\",\"type\":\"int\"}],\"modifiers\":[\"public\"],\"name\":\"Add\",\"parameters\":[{\"modifier\":\"\",\"name\":\"x\",\"type\":\"int\"},{\"modifier\":\"\",\"name\":\"y\",\"type\":\"int\"}],\"statements\":[{\"statementText\":\"int sum;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[],\"usedMethods\":[]},{\"statementText\":\"sum = x + y;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[\"sum\",\"x\",\"y\"],\"usedMethods\":[]},{\"statementText\":\"return sum;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[\"sum\"],\"usedMethods\":[]}],\"type\":\"int\"},{\"declaredVariables\":[],\"modifiers\":[\"public\"],\"name\":\"Multiply\",\"parameters\":[{\"modifier\":\"\",\"name\":\"x\",\"type\":\"int\"},{\"modifier\":\"\",\"name\":\"y\",\"type\":\"int\"}],\"statements\":[{\"statementText\":\"return x * y;\",\"usedConstructors\":[],\"usedFieldsAndProperties\":[\"x\",\"y\"],\"usedMethods\":[]}],\"type\":\"int\"}],\"modifiers\":[\"public\"],\"name\":\"Math\",\"namespace\":\"FruitDelivery\",\"namespaceDependecies\":[\"System\",\"System.Collections.Generic\",\"System.Linq\",\"System.Text\",\"System.Threading.Tasks\"],\"parentInheritances\":[],\"properties\":[{\"accessors\":[{\"body\":[],\"declaredVariables\":[],\"type\":\"get\"},{\"body\":[],\"declaredVariables\":[],\"type\":\"set\"}],\"modifiers\":[\"public\"],\"name\":\"MagicNumber\",\"type\":\"int\"}]}],\"enums\":[],\"interfaces\":[],\"structs\":[]}"
    );
export const types: IType[] = parsedTypes.classes.map(type => new Class(type) as IType)
    .concat(parsedTypes.structs.map(type => new Struct(type)))
    .concat(parsedTypes.interfaces.map(type => new Interface(type)))
    .concat(parsedTypes.enums.map(type => new Enum(type)));
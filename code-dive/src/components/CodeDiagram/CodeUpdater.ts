import { CodeComponentType } from "./CodeComponentType";
import { IType } from "../../codeModel/Types/IType";
import { Class } from "../../codeModel/Types/Class";
import { Struct } from "../../codeModel/Types/Struct";
import { Interface } from "../../codeModel/Types/Interface";
import { Enum } from "../../codeModel/Types/Enum";

import { Constructor } from "../../codeModel/Misc/Constructor";
import { Method } from "../../codeModel/Misc/Method";
import { Property } from "../../codeModel/Misc/Property";
import { PropertyAccessor } from "../../codeModel/Misc/PropertyAccessor";
import { Statement } from "../../codeModel/Misc/Statement";
import { EnumValue } from "../../codeModel/Misc/EnumValue";
import { Field } from "../../codeModel/Misc/Field";
import { FixedParameter } from "../../codeModel/Misc/FixedParameter";

export class CodeUpdater {
    public updateCode(typeCopy: IType, nodeData: any) {
        var codeComponentLocation = nodeData.codeComponentLocation;
        switch(codeComponentLocation.type) {
            case (CodeComponentType.EnumValue):
                var enumValue = (typeCopy as Enum).values.find(value => value.index === codeComponentLocation.valueIndex) as EnumValue;
                enumValue.name = nodeData.value;
                break;
            case (CodeComponentType.Field):
                var field = (typeCopy as Class | Struct).fields.find(field => field.index === codeComponentLocation.fieldIndex) as Field;
                field.modifiers = nodeData.modifiers;
                field.name = nodeData.name;
                field.type = nodeData.type;
                field.assignmentStatement = new Statement({
                    blockCount: 0, index: 0,
                    statementText: nodeData.assignmentStatement,
                    usedConstructors: [], usedFieldsAndProperties: [], usedMethods: [], usedTypes: []
                });
                break;
            case (CodeComponentType.PropertyAccessor):
                var property = (typeCopy as Class | Struct | Interface).properties.find(property => property.index === codeComponentLocation.propertyIndex) as Property;
                var accessor = property.accessors.find(accessor => accessor.index === codeComponentLocation.accessorIndex) as PropertyAccessor;
                accessor.name = nodeData.propertyAccessorName;
                break;
            case (CodeComponentType.Property):
                var property = (typeCopy as Class | Struct | Interface).properties.find(property => property.index === codeComponentLocation.propertyIndex) as Property;
                property.modifiers = nodeData.modifiers;
                property.name = nodeData.name;
                property.type = nodeData.type;
                property.assignmentStatement = new Statement({
                    blockCount: 0, index: 0,
                    statementText: nodeData.assignmentStatement,
                    usedConstructors: [], usedFieldsAndProperties: [], usedMethods: [], usedTypes: []
                });
                break;
            case (CodeComponentType.Constructor):
                var constructor = (typeCopy as Class | Struct).constructors.find(constructor => constructor.index === codeComponentLocation.constructorIndex) as Constructor;
                constructor.modifiers = nodeData.modifiers;
                constructor.name = nodeData.name;
                break;
            case (CodeComponentType.Method):
                var method = (typeCopy as Class | Struct).methods.find(method => method.index === codeComponentLocation.methodIndex) as Method;
                method.modifiers = nodeData.modifiers;
                method.name = nodeData.name;
                method.type = nodeData.type;
                break;
            case (CodeComponentType.Parameter):
                var callable = ((callableType: CodeComponentType): Constructor | Method | Property => {
                    switch (callableType) {
                        case (CodeComponentType.Constructor):
                            return (typeCopy as Class | Struct).constructors.find(callable => callable.index === codeComponentLocation.callableIndex) as Constructor;
                        case (CodeComponentType.Method):
                            return (typeCopy as Class | Struct | Interface).methods.find(callable => callable.index === codeComponentLocation.callableIndex) as Method;
                        default:
                            return (typeCopy as Class | Struct | Interface).properties.find(callable => callable.index === codeComponentLocation.callableIndex) as Property;
                    }
                })(codeComponentLocation.callableType);
                var parameter = callable.parameters.find(parameter => parameter.index === codeComponentLocation.parameterIndex) as FixedParameter;
                parameter.modifier = nodeData.modifier;
                parameter.name = nodeData.name;
                parameter.type = nodeData.type;
                parameter.assignmentStatement = new Statement({
                    blockCount: 0, index: 0,
                    statementText: nodeData.assignmentStatement,
                    usedConstructors: [], usedFieldsAndProperties: [], usedMethods: [], usedTypes: []
                });
                break;
            case (CodeComponentType.ConstructorOrMethodStatement):
                var constructorOrMethod: Constructor | Method = codeComponentLocation.callableType === CodeComponentType.Constructor ?
                    (typeCopy as Class | Struct).constructors.find(callable => callable.index === codeComponentLocation.callableIndex) as Constructor :
                    (typeCopy as Class | Struct | Interface).methods.find(callable => callable.index === codeComponentLocation.callableIndex) as Method;
                var statement = constructorOrMethod.statements.find(statement => statement.index === codeComponentLocation.statementIndex) as Statement;
                statement.statementText = nodeData.statementText;
                break;
            case (CodeComponentType.PropertyAccessorStatement):
                var property = (typeCopy as Class | Struct | Interface).properties.find(property => property.index === codeComponentLocation.propertyIndex) as Property;
                var accessor = property.accessors.find(accessor => accessor.index === codeComponentLocation.accessorIndex) as PropertyAccessor;
                var statement = accessor.body.find(statement => statement.index === codeComponentLocation.statementIndex) as Statement;
                statement.statementText = nodeData.statementText;
                break;
            case (CodeComponentType.Type):
                typeCopy.namespaceDependecies = nodeData.namespaceDependecies;
                typeCopy.namespace = nodeData.namespace;
                typeCopy.modifiers = nodeData.modifiers;
                typeCopy.name = nodeData.name;
                typeCopy.parentInheritances = nodeData.parentInheritances;
                // TODO: add conversions between classes, structs, interfaces and enums
                break;
        }
    }
}
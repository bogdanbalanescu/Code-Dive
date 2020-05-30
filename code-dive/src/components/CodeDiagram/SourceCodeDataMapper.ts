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

export class SourceCodeDataMapper {
    public deleteCodeForNodes(types: IType[], deletedNodesData: any[]): IType[] {
        deletedNodesData.forEach((nodeData: any) => {
            if (!nodeData.codeComponentLocation) return;
            var relevantTypeIndex = types.findIndex(
                type => type.namespace === nodeData.codeComponentLocation.typeNamespace && 
                type.name === nodeData.codeComponentLocation.typeName);
            if (relevantTypeIndex !== -1) {
                if (nodeData.codeComponentLocation.type === CodeComponentType.Type) {
                    types = types.filter(
                        type => type.namespace !== nodeData.codeComponentLocation.typeNamespace || 
                        type.name !== nodeData.codeComponentLocation.typeName);
                }
                else {
                    try {
                        this.deleteCodeForNode(types[relevantTypeIndex], nodeData);
                    }
                    catch (e) {};
                }
            }
        })
        return types;
    }
    private deleteCodeForNode(type: IType, nodeData: any) {
        type.isUpToDate = false;
        var codeComponentLocation = nodeData.codeComponentLocation;
        switch(codeComponentLocation.type) {
            // Type Member
            case (CodeComponentType.EnumValue):
                (type as Enum).values = (type as Enum).values.filter(value => value.index !== codeComponentLocation.valueIndex);
                break;
            case (CodeComponentType.Field):
                (type as Class | Struct).fields = (type as Class | Struct).fields.filter(field => field.index !== codeComponentLocation.fieldIndex);
                break;
            case (CodeComponentType.PropertyAccessor):
                var property = (type as Class | Struct | Interface).properties.find(property => property.index === codeComponentLocation.propertyIndex) as Property;
                property.accessors = property.accessors.filter(accessor => accessor.index !== codeComponentLocation.accessorIndex);
                break;
            case (CodeComponentType.Property):
                (type as Class | Struct | Interface).properties = (type as Class | Struct | Interface).properties.filter(property => property.index !== codeComponentLocation.propertyIndex);
                break;
            case (CodeComponentType.Constructor):
                (type as Class | Struct).constructors = (type as Class | Struct).constructors.filter(constructor => constructor.index !== codeComponentLocation.constructorIndex);
                break;
            case (CodeComponentType.Method):
                (type as Class | Struct).methods = (type as Class | Struct).methods.filter(method => method.index !== codeComponentLocation.methodIndex);
                break;
            // Misc
            case (CodeComponentType.Parameter):
                var callable = ((callableType: CodeComponentType): Constructor | Method | Property => {
                    switch (callableType) {
                        case (CodeComponentType.Constructor):
                            return (type as Class | Struct).constructors.find(callable => callable.index === codeComponentLocation.callableIndex) as Constructor;
                        case (CodeComponentType.Method):
                            return (type as Class | Struct | Interface).methods.find(callable => callable.index === codeComponentLocation.callableIndex) as Method;
                        default:
                            return (type as Class | Struct | Interface).properties.find(callable => callable.index === codeComponentLocation.callableIndex) as Property;
                    }
                })(codeComponentLocation.callableType);
                callable.parameters = callable.parameters.filter(parameter => parameter.index !== codeComponentLocation.parameterIndex);
                break;
            case (CodeComponentType.ConstructorOrMethodStatement):
                var constructorOrMethod: Constructor | Method = codeComponentLocation.callableType === CodeComponentType.Constructor ?
                    (type as Class | Struct).constructors.find(callable => callable.index === codeComponentLocation.callableIndex) as Constructor :
                    (type as Class | Struct | Interface).methods.find(callable => callable.index === codeComponentLocation.callableIndex) as Method;
                constructorOrMethod.statements = constructorOrMethod.statements.filter(statement => statement.index !== codeComponentLocation.statementIndex);
                break;
            case (CodeComponentType.PropertyAccessorStatement):
                var property = (type as Class | Struct | Interface).properties.find(property => property.index === codeComponentLocation.propertyIndex) as Property;
                var accessor = property.accessors.find(accessor => accessor.index === codeComponentLocation.accessorIndex) as PropertyAccessor;
                accessor.body = accessor.body.filter(statement => statement.index !== codeComponentLocation.statementIndex);
                break;
        }
    }

    public updateCodeForNode(types: IType[], nodeData: any) {
        var relevantType = types.find(
            type => type.namespace === nodeData.codeComponentLocation.typeNamespace && 
            type.name === nodeData.codeComponentLocation.typeName) as IType;
        this.updateCodeForNodeInType(relevantType, nodeData);
        return types;
    }
    private updateCodeForNodeInType(type: IType, nodeData: any) {
        type.isUpToDate = false;
        var codeComponentLocation = nodeData.codeComponentLocation;
        switch(codeComponentLocation.type) {
            // Type
            case (CodeComponentType.Type):
                type.namespaceDependecies = nodeData.namespaceDependecies;
                type.namespace = nodeData.namespace;
                type.modifiers = nodeData.modifiers;
                type.name = nodeData.name;
                type.parentInheritances = nodeData.parentInheritances;
                // TODO: add conversions between classes, structs, interfaces and enums
                break;
            // Type Member
            case (CodeComponentType.EnumValue):
                var enumValue = (type as Enum).values.find(value => value.index === codeComponentLocation.valueIndex) as EnumValue;
                enumValue.name = nodeData.value;
                break;
            case (CodeComponentType.Field):
                var field = (type as Class | Struct).fields.find(field => field.index === codeComponentLocation.fieldIndex) as Field;
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
                var property = (type as Class | Struct | Interface).properties.find(property => property.index === codeComponentLocation.propertyIndex) as Property;
                var accessor = property.accessors.find(accessor => accessor.index === codeComponentLocation.accessorIndex) as PropertyAccessor;
                accessor.name = nodeData.propertyAccessorName;
                break;
            case (CodeComponentType.Property):
                var property = (type as Class | Struct | Interface).properties.find(property => property.index === codeComponentLocation.propertyIndex) as Property;
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
                var constructor = (type as Class | Struct).constructors.find(constructor => constructor.index === codeComponentLocation.constructorIndex) as Constructor;
                constructor.modifiers = nodeData.modifiers;
                constructor.name = nodeData.name;
                break;
            case (CodeComponentType.Method):
                var method = (type as Class | Struct).methods.find(method => method.index === codeComponentLocation.methodIndex) as Method;
                method.modifiers = nodeData.modifiers;
                method.name = nodeData.name;
                method.type = nodeData.type;
                break;
            // Misc
            case (CodeComponentType.Parameter):
                var callable = ((callableType: CodeComponentType): Constructor | Method | Property => {
                    switch (callableType) {
                        case (CodeComponentType.Constructor):
                            return (type as Class | Struct).constructors.find(callable => callable.index === codeComponentLocation.callableIndex) as Constructor;
                        case (CodeComponentType.Method):
                            return (type as Class | Struct | Interface).methods.find(callable => callable.index === codeComponentLocation.callableIndex) as Method;
                        default:
                            return (type as Class | Struct | Interface).properties.find(callable => callable.index === codeComponentLocation.callableIndex) as Property;
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
                    (type as Class | Struct).constructors.find(callable => callable.index === codeComponentLocation.callableIndex) as Constructor :
                    (type as Class | Struct | Interface).methods.find(callable => callable.index === codeComponentLocation.callableIndex) as Method;
                var statement = constructorOrMethod.statements.find(statement => statement.index === codeComponentLocation.statementIndex) as Statement;
                statement.statementText = nodeData.statementText;
                break;
            case (CodeComponentType.PropertyAccessorStatement):
                var property = (type as Class | Struct | Interface).properties.find(property => property.index === codeComponentLocation.propertyIndex) as Property;
                var accessor = property.accessors.find(accessor => accessor.index === codeComponentLocation.accessorIndex) as PropertyAccessor;
                var statement = accessor.body.find(statement => statement.index === codeComponentLocation.statementIndex) as Statement;
                statement.statementText = nodeData.statementText;
                break;
        }
    }
}
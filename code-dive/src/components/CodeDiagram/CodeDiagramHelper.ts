import { IType } from '../../codeModel/Types/IType'
import { Class } from '../../codeModel/Types/Class';
import { Struct } from '../../codeModel/Types/Struct';
import { Interface } from '../../codeModel/Types/Interface';
import { Enum } from '../../codeModel/Types/Enum';

import { Field } from '../../codeModel/Misc/Field';
import { Property } from '../../codeModel/Misc/Property';
import { Constructor } from '../../codeModel/Misc/Constructor';
import { Method } from '../../codeModel/Misc/Method';
import { PropertyAccessor } from '../../codeModel/Misc/PropertyAccessor';
import { FixedParameter } from '../../codeModel/Misc/FixedParameter';
import { Statement } from '../../codeModel/Misc/Statement';

export class CodeDiagramHelper {
    public static ComputeNodeAndLinkData(props: {types: IType[]}): {nodeDataArray: any, linkDataArray: any} {
        const typesGroupedByNamespace = CodeDiagramHelper.groupTypesByProperty(props.types, 'namespace');
        var linkData: any = [];
        const createInheritanceLinks = (type: IType) =>
            CodeDiagramHelper.createInheritanceLinks(type, typesGroupedByNamespace, linkData);
        const createMethodTypeLink = (type: Class | Struct | Interface, method: Method) =>
            CodeDiagramHelper.createMethodTypeLink(type, method, typesGroupedByNamespace, linkData);
        const createStatementLinks = (type: IType, callable: Method | Constructor | PropertyAccessor, statement: Statement, statementPort: string) =>
            CodeDiagramHelper.createStatementLinks(type, callable, statement, statementPort, typesGroupedByNamespace, linkData);
        const createParameterLinks = (type: IType, parameterType: string, parameterPort: string) =>
            {}// CodeDiagramHelper.createParameterLinks(type, parameterType, parameterPort, typesGroupedByNamespace, linkData);

        const mapField = (type: Class | Struct, field: Field) => {
            return {
                modifiers: field.modifiers,
                name: field.name,
                type: field.type,
                portId: CodeDiagramHelper.fieldOrPropertyPort(type, field)
            };
        };
        const mapStatement = (type: Class | Struct | Interface, callable: Method | Constructor | PropertyAccessor, statement: Statement, statementPort: string) => {
            createStatementLinks(type, callable, statement, statementPort);
            return {
                statementText: statement.statementText,
                portId: statementPort
            };
        };
        const mapParameter = (type: Class | Struct | Interface, callable: Method | Constructor | PropertyAccessor, parameter: FixedParameter) => {
            var parameterPort = CodeDiagramHelper.constructorOrMethodOrPropertyAccessorParameterPort(type, callable, parameter);
            createParameterLinks(type, parameter.type, parameterPort);
            return {
                modifier: parameter.modifier,
                name: parameter.name,
                type: parameter.type,
                portId: parameterPort
            };
        };
        const mapPropertyAccessor = (type: Class | Struct | Interface, property: Property, accessor :PropertyAccessor) => {
            return {
                name: accessor.name,
                // TODO: analyze the need for a port here
                // portId: CodeDiagramHelper.constructorOrMethodOrPropertyAccessorPort(type, accessor),
                parameters: accessor.parameters.map(parameter => mapParameter(type, accessor, parameter)),
                body: accessor.body.map((statement: Statement, index: number) => {
                    var statementPort = CodeDiagramHelper.propertyAccessorStatementPort(type, property, accessor, index);
                    return mapStatement(type, accessor, statement, statementPort);
                })
            };
        };
        const mapProperty = (type: Class | Struct | Interface, property: Property) => {
            return {
                modifiers: property.modifiers,
                name: property.name,
                type: property.type,
                portId: CodeDiagramHelper.fieldOrPropertyPort(type, property),
                accessors: property.accessors.map(accessor => mapPropertyAccessor(type, property, accessor))
            };
        };
        const mapConstructor = (type: Class | Struct | Interface, constructor: Constructor) => {
            return {
                modifiers: constructor.modifiers,
                name: constructor.name,
                portId: CodeDiagramHelper.constructorOrMethodOrPropertyAccessorPort(type, constructor),
                parameters: constructor.parameters.map(parameter => mapParameter(type, constructor, parameter)),
                statements: constructor.statements.map((statement: Statement, index: number) => {
                    var statementPort = CodeDiagramHelper.constructorOrMethodStatementPort(type, constructor, index);
                    return mapStatement(type, constructor, statement, statementPort);
                }),
            };
        };
        const mapMethod = (type: Class | Struct | Interface, method: Method) => {
            createMethodTypeLink(type, method);
            return {
                modifiers: method.modifiers,
                name: method.name,
                type: method.type,
                portId: CodeDiagramHelper.constructorOrMethodOrPropertyAccessorPort(type, method),
                parameters: method.parameters.map(parameter => mapParameter(type, method, parameter)),
                statements: method.statements.map((statement: Statement, index: number) => {
                    var statementPort = CodeDiagramHelper.constructorOrMethodStatementPort(type, method, index);
                    return mapStatement(type, method, statement, statementPort);
                }),
            };
        };

        // Map Types (classes, structs, interfaces and enums)
        const mapType = (type: IType) => {
            createInheritanceLinks(type);
            return {
                key: CodeDiagramHelper.typeKey(type),
                modifiers: type.modifiers,
                name: type.name,
                portId: CodeDiagramHelper.typePort(type),
            };
        }
        const mapClassOrStructToNode = (type: Class | Struct) => {
            return {
                category: type instanceof Class? "class": "struct",
                ...mapType(type),
                fields: type.fields.map(field => mapField(type, field)),
                properties: type.properties.map(property => mapProperty(type, property)),
                constructors: type.constructors.map(constructor => mapConstructor(type, constructor)),
                methods: type.methods.map(method => mapMethod(type, method))
            };
        };
        const mapInterfaceToNode = (type: Interface) => {
            return {
                category: "interface",
                ...mapType(type),
                properties: type.properties.map(property => mapProperty(type, property)),
                methods: type.methods.map(method => mapMethod(type, method))
            };
        }
        const mapEnumToNode = (type: Enum) => {
            return {
                category: "enum",
                ...mapType(type),
                values: type.values.map(value => {
                    return {
                        value: value,
                        portId: CodeDiagramHelper.enumValuePort(type, value)
                    }
                })
            };
        }
        
        var classNodeData = props.types.filter(type => type instanceof Class).map(type => mapClassOrStructToNode(type as Class));
        var structNodeData = props.types.filter(type => type instanceof Struct).map(type => mapClassOrStructToNode(type as Struct));
        var interfaceNodeData = props.types.filter(type => type instanceof Interface).map(type => mapInterfaceToNode(type as Interface));
        var enumNodeData = props.types.filter(type => type instanceof Enum).map(type => mapEnumToNode(type as Enum));

        var nodeData = (classNodeData as any).concat(structNodeData).concat(interfaceNodeData).concat(enumNodeData);
        return {
            nodeDataArray: nodeData,
            linkDataArray: linkData
        };
    }

    // helper functions for finding types and members
    private static groupTypesByProperty (types: any, key: any): any {
        return types.reduce(function (rv: any, x: any) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };
    private static findTypeInRelevantNamespaces (type: IType, typeName: string, typesGroupedByNamespace: any): IType | undefined {
        var namespaces = type.namespaceDependecies.concat([type.namespace]);
        for (let namespace of namespaces) {
            var relevantNamespace = typesGroupedByNamespace[namespace];
            if (relevantNamespace !== undefined) {
                var otherType = relevantNamespace.find((other: IType) => other.name == typeName);
                if (otherType !== undefined) return otherType;
            }
        }
    };
    private static findFieldOrPropertyInType (type: IType | null, fieldOrPropertyName: string): Field | Property | undefined {
        if (type instanceof Class || type instanceof Struct) {
            var field = type.fields.find(field => field.name == fieldOrPropertyName);
            if (field !== undefined) return field;
        }
        if (type instanceof Class || type instanceof Struct || type instanceof Interface) {
            var property = type.properties.find(property => property.name == fieldOrPropertyName);
            if (property !== undefined) return property;
        }
    };
    private static findEnumInType(type: Enum, enumValue: string): string | undefined {
        var value = type.values.find(value => value == enumValue);
        if (value !== undefined) return value;
    }
    private static findConstructorOrMethodInType (type: IType | null, callableName: string): Constructor | undefined {
        if (type instanceof Class || type instanceof Struct) {
            var constructor = type.constructors.find(constructor => constructor.name == callableName);
            if (constructor !== undefined) return constructor;
        }
        if (type instanceof Class || type instanceof Struct || type instanceof Interface) {
            var method = type.methods.find(method => method.name == callableName);
            if (method !== undefined) return method;
        }
    }

    // Create keys for types and type members
    private static typeKey = 
        (type: IType) => `${type.namespace}.${type.name}`;
    private static typePort = 
        (type: IType) => `${type.namespace}.${type.name}`;
    private static fieldOrPropertyPort = 
        (type: Class | Struct | Interface, fieldOrProperty: Field | Property) => `${CodeDiagramHelper.typeKey(type)}.${fieldOrProperty.name}`;
    private static enumValuePort =
        (type: Enum, value: string) => `${CodeDiagramHelper.typeKey(type)}.${value}`;
    private static propertyAccessorStatementPort = 
        (type: Class | Struct | Interface, property: Property, accessor: PropertyAccessor, index: number) => `${CodeDiagramHelper.fieldOrPropertyPort(type, property)}.${accessor.name}:${index}`;
    private static constructorOrMethodOrPropertyAccessorPort = 
        (type: IType, constructor: Constructor | Method | PropertyAccessor) => `${CodeDiagramHelper.typeKey(type)}.${constructor.name}:${constructor.parameters.map(parameter => parameter.type).join('.')}:`;
    private static constructorOrMethodOrPropertyAccessorParameterPort = 
        (type: IType, constructor: Constructor | Method | PropertyAccessor, parameter: FixedParameter) => `${CodeDiagramHelper.constructorOrMethodOrPropertyAccessorPort(type, constructor)}.${parameter.name}`;
    private static constructorOrMethodStatementPort = 
        (type: Class | Struct | Interface, constructor: Constructor | Method, index: number) => `${CodeDiagramHelper.constructorOrMethodOrPropertyAccessorPort(type, constructor)}${index}`;

    // Creating and adding links
    private static addLink = (from: string, fromPort: string, to: string, toPort: string, linkData: any) => linkData.push({
        key: linkData.length, from: from, fromPort: fromPort, to: to, toPort: toPort
    });
    private static addLinkFromStatementToFieldOrProperty (type: IType, fieldOrPropertyType: string, fieldOrPropertyName: string, statementPort: string, typesGroupedByNamespace: any, linkData: any) {
        var relevantType = CodeDiagramHelper.findTypeInRelevantNamespaces(type, fieldOrPropertyType, typesGroupedByNamespace);
        if (relevantType !== undefined) { // if parameter type is a customly defined one
            var fieldOrPropertyOfRelevantType = CodeDiagramHelper.findFieldOrPropertyInType(relevantType, fieldOrPropertyName);
            if (fieldOrPropertyOfRelevantType !== undefined) {
                CodeDiagramHelper.addLink(
                    CodeDiagramHelper.typeKey(type), 
                    statementPort, 
                    CodeDiagramHelper.typeKey(relevantType as IType), 
                    CodeDiagramHelper.fieldOrPropertyPort(relevantType as Class | Struct | Interface, fieldOrPropertyOfRelevantType as Field | Property),
                    linkData);
            }
        }
    };
    private static addLinkFromStatementToEnumValue (type: IType, fieldOrPropertyType: string, fieldOrPropertyName: string, statementPort: string, typesGroupedByNamespace: any, linkData: any) {
        var relevantType = CodeDiagramHelper.findTypeInRelevantNamespaces(type, fieldOrPropertyType, typesGroupedByNamespace);
        if (relevantType !== undefined && relevantType instanceof Enum) { // if parameter type is a customly defined one and an Enum
            var enumValueOfRelevantType = CodeDiagramHelper.findEnumInType(relevantType, fieldOrPropertyName);
            if (enumValueOfRelevantType !== undefined) {
                CodeDiagramHelper.addLink(
                    CodeDiagramHelper.typeKey(type), 
                    statementPort, 
                    CodeDiagramHelper.typeKey(relevantType as IType), 
                    CodeDiagramHelper.enumValuePort(relevantType as Enum, enumValueOfRelevantType as string),
                    linkData);
            }
        }
    }
    private static addLinkFromStatementToConstructorOrMethod (type: IType, callableType: string, callableName: string, statementPort: string, typesGroupedByNamespace: any, linkData: any) {
        var relevantType = CodeDiagramHelper.findTypeInRelevantNamespaces(type, callableType, typesGroupedByNamespace);
        if (relevantType !== undefined) {
            var callable = CodeDiagramHelper.findConstructorOrMethodInType(relevantType, callableName);
            if (callable !== undefined) {
                CodeDiagramHelper.addLink(
                    CodeDiagramHelper.typeKey(type),
                    statementPort,
                    CodeDiagramHelper.typeKey(relevantType as IType),
                    CodeDiagramHelper.constructorOrMethodOrPropertyAccessorPort(relevantType as Class | Struct, callable as Constructor | Method),
                    linkData
                )
            }
        }
    }
    private static addLinkFromStatementToType (type: IType, usedType: string, statementPort: string, typesGroupedByNamespace: any, linkData: any) {
        var relevantType = CodeDiagramHelper.findTypeInRelevantNamespaces(type, usedType, typesGroupedByNamespace);
        if (relevantType !== undefined) {
            CodeDiagramHelper.addLink(
                CodeDiagramHelper.typeKey(type),
                statementPort,
                CodeDiagramHelper.typeKey(relevantType as IType),
                CodeDiagramHelper.typeKey(relevantType as IType),
                linkData
            );
        }
    }
    private static createInheritanceLinks (type: IType, typesGroupedByNamespace: any, linkData: any) {
        type.parentInheritances.forEach((parentInheritance: string) => {
            var parent = CodeDiagramHelper.findTypeInRelevantNamespaces(type, parentInheritance, typesGroupedByNamespace);
            if (parent !== undefined) {
                CodeDiagramHelper.addLink(
                    CodeDiagramHelper.typeKey(type), 
                    CodeDiagramHelper.typePort(type), 
                    CodeDiagramHelper.typeKey(parent), 
                    CodeDiagramHelper.typePort(parent), 
                    linkData);
            }
        });
    };
    private static createMethodTypeLink (type: Class | Struct | Interface, method: Method, typesGroupedByNamespace: any, linkData: any) {
        var returnType = CodeDiagramHelper.findTypeInRelevantNamespaces(type, method.type, typesGroupedByNamespace);
        if (returnType !== undefined) {
            CodeDiagramHelper.addLink(
                CodeDiagramHelper.typeKey(type),
                CodeDiagramHelper.constructorOrMethodOrPropertyAccessorPort(type, method),
                CodeDiagramHelper.typeKey(returnType as IType),
                CodeDiagramHelper.typeKey(returnType as IType),
                linkData
            );
        }
    }
    private static createStatementLinks (type: IType, callable: Method | Constructor | PropertyAccessor, statement: Statement, statementPort: string, typesGroupedByNamespace: any, linkData: any) {
        statement.usedFieldsAndProperties.forEach((fieldOrProperty: string) => {
            var fieldOrPropertyAtoms = fieldOrProperty.split('.'); // convention: fieldOrPropertyAtoms can have either 1 or 2 elements
            if (fieldOrPropertyAtoms.length > 1) { // if member access
                var parametersIndex = callable.parameters.findIndex(parameter => parameter.name == fieldOrPropertyAtoms[0]);
                var declaredVariablesIndex = callable.declaredVariables.findIndex(declaredVariable => declaredVariable.name == fieldOrPropertyAtoms[0]);
                if (parametersIndex !== -1 && !(callable instanceof PropertyAccessor)) { // if type can be inferred from parameters
                    var parameter = callable.parameters[parametersIndex];
                    CodeDiagramHelper.addLinkFromStatementToFieldOrProperty(type, parameter.type, fieldOrPropertyAtoms[1], statementPort, typesGroupedByNamespace, linkData);
                }
                else if (declaredVariablesIndex !== -1) { // if type can be inferred from declared variables
                    var declaredVariable = callable.declaredVariables[declaredVariablesIndex];
                    CodeDiagramHelper.addLinkFromStatementToFieldOrProperty(type, declaredVariable.type, fieldOrPropertyAtoms[1], statementPort, typesGroupedByNamespace, linkData);
                }
                else { // if it is possibly a static member of a certain type
                    CodeDiagramHelper.addLinkFromStatementToFieldOrProperty(type, fieldOrPropertyAtoms[0], fieldOrPropertyAtoms[1], statementPort, typesGroupedByNamespace, linkData);
                    CodeDiagramHelper.addLinkFromStatementToEnumValue(type, fieldOrPropertyAtoms[0], fieldOrPropertyAtoms[1], statementPort, typesGroupedByNamespace, linkData);
                }
            }
            else { // if it refers to members present on the same type
                // TODO: analyze if this is needed at all
                // CodeDiagramHelper.addLinkFromStatementToFieldOrProperty(type, type.name, fieldOrPropertyAtoms[0], statementPort, typesGroupedByNamespace, linkData);
            }
        });
        statement.usedConstructors.forEach((constructor: string) => { // Warning: currently, overloading is not supported
            var constructorAtoms = constructor.split('.'); // convention: constructor can have either 1 or 2 elements
            if (constructorAtoms.length > 1) { // if member access
                CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, constructorAtoms[1], constructorAtoms[1], statementPort, typesGroupedByNamespace, linkData);
            }
            else { // if it refers to members present on the same type
                // TODO: analyze if this is needed at all
                // CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, constructorAtoms[0], constructorAtoms[0], statementPort, typesGroupedByNamespace, linkData);
            }
        });
        statement.usedMethods.forEach((method: string) => { // Warning: currently, overloading is not supported
            var methodAtoms = method.split('.'); // convention: method can have either 1 or 2 elements
            if (methodAtoms.length > 1) { // if member access
                var parametersIndex = callable.parameters.findIndex(parameter => parameter.name == methodAtoms[0]);
                var declaredVariablesIndex = callable.declaredVariables.findIndex(declaredVariable => declaredVariable.name == methodAtoms[0]);
                if (parametersIndex !== -1 && !(callable instanceof PropertyAccessor)) { // if type can be inferred from parameters
                    var parameter = callable.parameters[parametersIndex];
                    CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, parameter.type, methodAtoms[1], statementPort, typesGroupedByNamespace, linkData);
                }
                else if (declaredVariablesIndex !== -1) { // if type can be inferred from declared variables
                    var declaredVariable = callable.declaredVariables[declaredVariablesIndex];
                    CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, declaredVariable.type, methodAtoms[1], statementPort, typesGroupedByNamespace, linkData);
                }
                else { // if it is possibly a static member of a certain type
                    CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, methodAtoms[0], methodAtoms[1], statementPort, typesGroupedByNamespace, linkData);
                }
            }
            else {
                // TODO: analyze if this is needed at all
                // CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, type.name, method, statementPort, typesGroupedByNamespace, linkData);
            }
        });
        statement.usedTypes.forEach((usedType: string) => {
            // CodeDiagramHelper.addLinkFromStatementToType(type, usedType, statementPort, typesGroupedByNamespace, linkData);
        });
    };
    private static createParameterLinks (type: IType, parameterType: string, parameterPort: string, typesGroupedByNamespace: any, linkData: any) {
        var referencedType = CodeDiagramHelper.findTypeInRelevantNamespaces(type, parameterType, typesGroupedByNamespace);
        if (referencedType !== undefined) {
            CodeDiagramHelper.addLink(
                CodeDiagramHelper.typeKey(type), 
                parameterPort, 
                CodeDiagramHelper.typeKey(referencedType), 
                CodeDiagramHelper.typePort(referencedType),
                linkData);
        }
    }
}
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
        const groupTypesByProperty = function (types: any, key: any) {
            return types.reduce(function (rv: any, x: any) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };
        var typesGroupedByNamespace = groupTypesByProperty(props.types, 'namespace');
        const findTypeInRelevantNamespaces = function (type: IType, typeName: string): IType | undefined {
            var namespaces = type.namespaceDependecies.concat([type.namespace]);
            for (let namespace of namespaces) {
                var relevantNamespace = typesGroupedByNamespace[namespace];
                if (relevantNamespace !== undefined) {
                    var otherType = relevantNamespace.find((other: IType) => other.name == typeName);
                    if (otherType !== undefined)
                        return otherType;
                }
            }
            ;
            return undefined;
        };
        const findFieldOrPropertyInType = function (type: IType | null, fieldOrPropertyName: string): Field | Property | undefined {
            if (type === null)
                return undefined;
            if (type instanceof Class || type instanceof Struct) {
                var field = type.fields.find(field => field.name == fieldOrPropertyName);
                if (field !== undefined)
                    return field;
            }
            if (type instanceof Class || type instanceof Struct || type instanceof Interface) {
                var property = type.properties.find(property => property.name == fieldOrPropertyName);
                if (property !== undefined)
                    return property;
            }
            return undefined;
        };
        const findConstructorOrMethodInType = function(type: IType | null, callableName: string): Constructor | undefined {
            if (type === null)
                return undefined;
            if (type instanceof Class || type instanceof Struct) {
                var constructor = type.constructors.find(constructor => constructor.name == callableName);
                if (constructor !== undefined)
                    return constructor;
            }
            if (type instanceof Class || type instanceof Struct || type instanceof Interface) {
                var method = type.methods.find(method => method.name == callableName);
                if (method !== undefined) {
                    return method;
                }
            }
            return undefined;
        }

        const typeKey = 
            (type: IType) => `${type.namespace}.${type.name}`;
        const typePort = 
            (type: IType) => `${type.namespace}.${type.name}`;
        const fieldOrPropertyPort = 
            (type: Class | Struct | Interface, fieldOrProperty: Field | Property) => `${typeKey(type)}.${fieldOrProperty.name}`;
        const propertyAccessorStatementPort = 
            (type: Class | Struct, property: Property, accessor: PropertyAccessor, index: number) => `${fieldOrPropertyPort(type, property)}.${accessor.type}:${index}`;
        const constructorOrMethodPort = 
            (type: IType, constructor: Constructor | Method) => `${typeKey(type)}.${constructor.name}:${constructor.parameters.map(parameter => parameter.type).join('.')}:`;
        const constructorOrMethodParameterPort = 
            (type: IType, constructor: Constructor | Method, parameter: FixedParameter) => `${constructorOrMethodPort(type, constructor)}.${parameter.name}`;
        const constructorOrMethodStatementPort = 
            (type: Class | Struct, constructor: Constructor | Method, index: number) => `${constructorOrMethodPort(type, constructor)}${index}`;
        

        var linkData: any = [];
        const addLink = (from: string, fromPort: string, to: string, toPort: string) => linkData.push({
            key: linkData.length, from: from, fromPort: fromPort, to: to, toPort: toPort
        });
        const addLinkFromStatementToFieldOrProperty = function (type: IType, fieldOrPropertyType: string, fieldOrPropertyName: string, statementPort: string) {
            var relevantType = findTypeInRelevantNamespaces(type, fieldOrPropertyType);
            if (relevantType !== undefined) { // if parameter type is a customly defined one
                var fieldOrPropertyOfRelevantType = findFieldOrPropertyInType(relevantType, fieldOrPropertyName);
                if (fieldOrPropertyOfRelevantType !== undefined) {
                    addLink(
                        typeKey(type), 
                        statementPort, 
                        typeKey(relevantType as IType), 
                        fieldOrPropertyPort(relevantType as Class | Struct | Interface, fieldOrPropertyOfRelevantType as Field | Property));
                }
            }
        };
        const addLinkFromStatementToConstructorOrMethod = function (type: IType, callableName: string, statementPort: string) {
            var relevantType = findTypeInRelevantNamespaces(type, callableName);
            if (relevantType !== undefined) {
                var callable = findConstructorOrMethodInType(relevantType, callableName);
                if (callable !== undefined) {
                    addLink(
                        typeKey(type),
                        statementPort,
                        typeKey(relevantType as IType),
                        constructorOrMethodPort(relevantType as Class | Struct, callable as Constructor | Method)
                    )
                }
            }
        }
        const createInheritanceLinks = function (type: Class) {
            type.parentInheritances.forEach((parentInheritance: string) => {
                var parent = findTypeInRelevantNamespaces(type, parentInheritance);
                if (parent !== undefined) {
                    addLink(typeKey(type), typePort(type), typeKey(parent), typePort(parent));
                }
            });
        };
        const createStatementLinks = function (type: IType, callable: Method | Constructor | PropertyAccessor, statement: Statement, statementPort: string) {
            statement.usedFieldsAndProperties.forEach((fieldOrProperty: string) => {
                var fieldOrPropertyAtoms = fieldOrProperty.split('.'); // convention: fieldOrPropertyAtoms can have either 1 or 2 elements
                if (fieldOrPropertyAtoms.length > 1) { // if member access
                    var parametersIndex = callable instanceof PropertyAccessor ? -1 : callable.parameters.findIndex(parameter => parameter.name == fieldOrPropertyAtoms[0]);
                    var declaredVariablesIndex = callable.declaredVariables.findIndex(declaredVariable => declaredVariable.name == fieldOrPropertyAtoms[0]);
                    if (parametersIndex !== -1 && !(callable instanceof PropertyAccessor)) { // if type can be inferred from parameters
                        var parameter = callable.parameters[parametersIndex];
                        addLinkFromStatementToFieldOrProperty(type, parameter.type, fieldOrPropertyAtoms[1], statementPort);
                    }
                    else if (declaredVariablesIndex !== -1) { // if type can be inferred from declared variables
                        var declaredVariable = callable.declaredVariables[declaredVariablesIndex];
                        addLinkFromStatementToFieldOrProperty(type, declaredVariable.type, fieldOrPropertyAtoms[1], statementPort);
                    }
                    else { // if it is possibly a static member of a certain type
                        addLinkFromStatementToFieldOrProperty(type, fieldOrPropertyAtoms[0], fieldOrPropertyAtoms[1], statementPort);
                    }
                }
                else { // if it refers to members present on the same type
                    addLinkFromStatementToFieldOrProperty(type, type.name, fieldOrPropertyAtoms[0], statementPort);
                }
            });
            statement.usedConstructors.forEach((constructor: string) => { // Warning: currently, overloading is not supported
                addLinkFromStatementToConstructorOrMethod(type, constructor, statementPort);
            });
            statement.usedMethods.forEach((method: string) => { // Warning: currently, overloading is not supported
                addLinkFromStatementToConstructorOrMethod(type, method, statementPort);
            });
        };
        const createParameterLinks = function (type: IType, parameterType: string, parameterPort: string) {
            var referencedType = findTypeInRelevantNamespaces(type, parameterType);
            if (referencedType !== undefined) {
                addLink(typeKey(type), parameterPort, typeKey(referencedType), typePort(referencedType));
            }
        }

        var parsedClasses = props.types.filter(type => type instanceof Class);
        var nodeData = props.types
            .map(type => type as Class | Struct)
            .map(type => {
                createInheritanceLinks(type);
                return {
                    // skip sourceFilePath - for now we only support the readonly model
                    // skip namespaceDependencies - for now we only show classes, structs, interfaces and enums - may show namespaces in the future
                    key: typeKey(type),
                    modifiers: type.modifiers,
                    name: type.name,
                    portId: typePort(type),
                    // skip parent inheritances -> will use these for links
                    fields: type.fields.map(field => {
                        return {
                            modifiers: field.modifiers,
                            name: field.name,
                            type: field.type,
                            portId: fieldOrPropertyPort(type, field)
                        };
                    }),
                    properties: type.properties.map(property => {
                        return {
                            modifiers: property.modifiers,
                            name: property.name,
                            type: property.type,
                            portId: fieldOrPropertyPort(type, property),
                            accessors: property.accessors.map(accessor => {
                                return {
                                    type: accessor.type,
                                    body: accessor.body.map((statement: Statement, index: number) => {
                                        var statementPort = propertyAccessorStatementPort(type, property, accessor, index);
                                        createStatementLinks(type, accessor, statement, statementPort);
                                        return {
                                            statementText: statement.statementText,
                                            portId: statementPort
                                            // skip used fields, properties, constructors and methods -> will use these for links,
                                        };
                                    })
                                };
                            })
                        };
                    }),
                    constructors: type.constructors.map(constructor => {
                        return {
                            modifiers: constructor.modifiers,
                            name: constructor.name,
                            portId: constructorOrMethodPort(type, constructor),
                            parameters: constructor.parameters.map(parameter => {
                                var parameterPort = constructorOrMethodParameterPort(type, constructor, parameter);
                                createParameterLinks(type, parameter.type, parameterPort);
                                return {
                                    modifier: parameter.modifier,
                                    name: parameter.name,
                                    type: parameter.type,
                                    portId: parameterPort
                                };
                            }),
                            // skip declared variables -> will use these for links
                            statements: constructor.statements.map((statement: Statement, index: number) => {
                                var statementPort = constructorOrMethodStatementPort(type, constructor, index);
                                createStatementLinks(type, constructor, statement, statementPort);
                                return {
                                    statementText: statement.statementText,
                                    portId: statementPort
                                    // skip used fields, properties, constructors and methods -> will use these for links
                                };
                            }),
                        };
                    }),
                    methods: type.methods.map(method => {
                        return {
                            modifiers: method.modifiers,
                            name: method.name,
                            type: method.type,
                            portId: constructorOrMethodPort(type, method),
                            parameters: method.parameters.map(parameter => {
                                var parameterPort = constructorOrMethodParameterPort(type, method, parameter);
                                createParameterLinks(type, parameter.type, parameterPort);
                                return {
                                    modifier: parameter.modifier,
                                    name: parameter.name,
                                    type: parameter.type,
                                    portId: parameterPort
                                };
                            }),
                            // skip declared variables -> will use these for links
                            statements: method.statements.map((statement: Statement, index: number) => {
                                var statementPort = constructorOrMethodStatementPort(type, method, index);
                                createStatementLinks(type, method, statement, statementPort);
                                return {
                                    statementText: statement.statementText,
                                    portId: statementPort
                                };
                            }),
                        };
                    })
                };
            });

        return {
            nodeDataArray: nodeData,
            linkDataArray: linkData
        };
    }
}
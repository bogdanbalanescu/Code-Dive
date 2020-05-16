import { IType } from '../../codeModel/Types/IType'
import { Class } from '../../codeModel/Types/Class';
import { Struct } from '../../codeModel/Types/Struct';
import { Interface } from '../../codeModel/Types/Interface';
import { Enum } from '../../codeModel/Types/Enum';

import { EnumValue } from '../../codeModel/Misc/EnumValue';
import { Field } from '../../codeModel/Misc/Field';
import { Property } from '../../codeModel/Misc/Property';
import { Constructor } from '../../codeModel/Misc/Constructor';
import { Method } from '../../codeModel/Misc/Method';
import { PropertyAccessor } from '../../codeModel/Misc/PropertyAccessor';
import { FixedParameter } from '../../codeModel/Misc/FixedParameter';
import { Statement } from '../../codeModel/Misc/Statement';

import { LinkType } from './LinkType';
import { NodeType } from './NodeType';
import { StatementAtomSemantic } from './StatementAtomSemantic';

export class CodeDiagramHelper {
    public static ComputeNodeAndLinkData(props: {types: IType[]}): {nodeDataArray: any[], linkDataArray: any[]} {
        const typesGroupedByNamespace = CodeDiagramHelper.groupTypesByProperty(props.types, 'namespace');
        var linkData: any = [];
        const createInheritanceLinks = (type: IType) =>
            CodeDiagramHelper.createInheritanceLinks(type, typesGroupedByNamespace, linkData);
        const createMethodTypeLink = (type: Class | Struct | Interface, method: Method) =>
            CodeDiagramHelper.createMethodTypeLink(type, method, typesGroupedByNamespace, linkData);
        const createStatementLinks = (type: IType, callable: Method | Constructor, statement: Statement, statementKey: string) =>
            CodeDiagramHelper.createStatementLinks(type, callable, statement, statementKey, typesGroupedByNamespace, linkData);
        const createPropertyAccessorStatementLinks = (type: IType, property: Property, accessor: PropertyAccessor, statement: Statement, statementKey: string) =>
            CodeDiagramHelper.createPropertyAccessorStatementLinks(type, property, accessor, statement, statementKey, typesGroupedByNamespace, linkData);
        const createParameterLinks = (type: IType, parameterType: string, parameterKey: string) =>
            CodeDiagramHelper.createParameterLinks(type, parameterType, parameterKey, typesGroupedByNamespace, linkData);

        var nodeData: any = [];
        // Create nodes for enum values
        const createNodeForEnumValue = (type: Enum, value: EnumValue) => {
            nodeData.push({
                category: NodeType.EnumValue,
                group: CodeDiagramHelper.enumValuesContainerKey(type),
                key: CodeDiagramHelper.enumValueKey(type, value),
                value: value.name
            });
        };
        const createNodesForEnumValues = (type: Enum) => {
            nodeData.push({
                category: NodeType.EnumValuesContainer,
                group: CodeDiagramHelper.typeKey(type),
                key: CodeDiagramHelper.enumValuesContainerKey(type),
                isGroup: true
            });
            type.values.forEach(value => createNodeForEnumValue(type, value));
        }
        // Create nodes for fields
        const createNodeForField = (type: Class | Struct, field: Field) => {
            // TODO: see if you need links from field to their types
            nodeData.push({
                category: NodeType.Field,
                group: CodeDiagramHelper.fieldsContainerKey(type),
                key: CodeDiagramHelper.fieldOrPropertyKey(type, field),
                modifiers: field.modifiers,
                name: field.name,
                type: field.type,
            });
        };
        const createNodesForFields = (type: Class | Struct) => {
            nodeData.push({
                category: NodeType.FieldsContainer,
                group: CodeDiagramHelper.typeKey(type),
                key: CodeDiagramHelper.fieldsContainerKey(type),
                isGroup: true
            });
            type.fields.forEach(field => createNodeForField(type, field));
        }
        // Create nodes for parameters
        const createNodeForParameter = (type: Class | Struct | Interface, callable: Method | Constructor | Property, parameter: FixedParameter, isLast: boolean) => {
            var parameterKey = CodeDiagramHelper.constructorOrMethodOrPropertyParameterKey(type, callable, parameter);
            createParameterLinks(type, parameter.type, parameterKey);
            // TODO: add links for parameter assignemnt statement as well -> refactor the logic for adding statement links
            var statementAtoms = CodeDiagramHelper.mapStatementToStatementAtoms(parameter.assignmentStatement);
            nodeData.push({
                category: NodeType.Parameter,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyHeaderKey(type, callable),
                key: parameterKey,
                modifier: parameter.modifier,
                name: parameter.name,
                type: parameter.type,
                isLast: isLast,
                statementAtoms: statementAtoms
            });
        };
        // Create nodes for statements
        const createNodeForStatement = (type: Class | Struct | Interface, callable: Method | Constructor, statement: Statement) => {
            var statementKey = CodeDiagramHelper.constructorOrMethodStatementKey(type, callable, statement);
            createStatementLinks(type, callable, statement, statementKey);
            var statementAtoms = CodeDiagramHelper.mapStatementToStatementAtoms(statement);
            nodeData.push({
                category: NodeType.Statement,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyBodyKey(type, callable),
                key: statementKey,
                statementAtoms: statementAtoms,
                blockCount: statement.blockCount
            });
        };
        const createNodeForPropertyAccessorStatement = (type: Class | Struct | Interface, property: Property, accessor: PropertyAccessor, statement: Statement) => {
            var statementKey = CodeDiagramHelper.propertyAccessorStatementKey(type, property, accessor, statement);
            createPropertyAccessorStatementLinks(type, property, accessor, statement, statementKey);
            var statementAtoms = CodeDiagramHelper.mapStatementToStatementAtoms(statement);
            nodeData.push({
                category: NodeType.Statement,
                group: CodeDiagramHelper.propertyAccessorKey(type, property, accessor),
                key: statementKey,
                statementAtoms: statementAtoms,
                blockCount: statement.blockCount
            });
        };
        // Create nodes for property accessor
        const createNodeForAccesor = (type: Class | Struct | Interface, property: Property, accessor: PropertyAccessor) => {
            nodeData.push({
                category: NodeType.PropertyAccessor,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyBodyKey(type, property),
                key: CodeDiagramHelper.propertyAccessorKey(type, property, accessor),
                name: accessor.name,
                isGroup: true
            });
            accessor.body.forEach(statement => createNodeForPropertyAccessorStatement(type, property, accessor, statement));
        }
        // Create nodes for properties
        const createNodeForPropertyHeader = (type: Class | Struct | Interface, property: Property) => {
            nodeData.push({
                category: NodeType.PropertyHeader,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyHeaderContainerKey(type, property),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyHeaderKey(type, property),
                modifiers: property.modifiers,
                name: property.name,
                type: property.type,
                isGroup: true
            });
            property.parameters.forEach(parameter => createNodeForParameter(type, property, parameter, CodeDiagramHelper.isLastInCollection(property.parameters, parameter)));
        };
        const createNodeForPropertyBody = (type: Class | Struct | Interface, property: Property) => {
            nodeData.push({
                category: NodeType.PropertyBody,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyBodyContainerKey(type, property),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyBodyKey(type, property),
                isGroup: true
            });
            property.accessors.forEach(accessor => createNodeForAccesor(type, property, accessor));
        }
        const createNodeForProperty = (type: Class | Struct | Interface, property: Property) => {
            // TODO: see if you need links from properties to their types
            nodeData.push({
                category: NodeType.Property,
                group: CodeDiagramHelper.propertyContainerKey(type),
                key: CodeDiagramHelper.fieldOrPropertyKey(type, property),
                isGroup: true
            });
            nodeData.push({
                category: NodeType.PropertyHeaderContainer,
                group: CodeDiagramHelper.fieldOrPropertyKey(type, property),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyHeaderContainerKey(type, property),
                isGroup: true
            });
            nodeData.push({
                category: NodeType.PropertyBodyContainer,
                group: CodeDiagramHelper.fieldOrPropertyKey(type, property),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyBodyContainerKey(type, property),
                isGroup: true
            });
            createNodeForPropertyHeader(type, property);
            createNodeForPropertyBody(type, property);
        };
        const createNodesForProperties = (type: Class | Struct | Interface) => {
            nodeData.push({
                category: NodeType.PropertiesContainer,
                group: CodeDiagramHelper.typeKey(type),
                key: CodeDiagramHelper.propertyContainerKey(type),
                isGroup: true
            });
            type.properties.forEach(property => createNodeForProperty(type, property));
        }
        // Create nodes for constructors
        const createNodeForConstructorHeader = (type: Class | Struct | Interface, constructor: Constructor) => {
            nodeData.push({
                category: NodeType.ConstructorHeader,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyHeaderContainerKey(type, constructor),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyHeaderKey(type, constructor),
                modifiers: constructor.modifiers,
                name: constructor.name,
                isGroup: true
            });
            constructor.parameters.forEach(parameter => createNodeForParameter(type, constructor, parameter, CodeDiagramHelper.isLastInCollection(constructor.parameters, parameter)));
        };
        const createNodeForConstructorBody = (type: Class | Struct | Interface, constructor: Constructor) => {
            nodeData.push({
                category: NodeType.ConstructorBody,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyBodyContainerKey(type, constructor),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyBodyKey(type, constructor),
                isGroup: true
            });
            constructor.statements.forEach(statement => createNodeForStatement(type, constructor, statement));
        }
        const createNodeForConstructor = (type: Class | Struct | Interface, constructor: Constructor) => {
            nodeData.push({
                category: NodeType.Constructor,
                group: CodeDiagramHelper.constructorsContainerKey(type),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(type, constructor),
                isGroup: true
            });
            nodeData.push({
                category: NodeType.ConstructorHeaderContainer,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(type, constructor),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyHeaderContainerKey(type, constructor),
                isGroup: true
            });
            nodeData.push({
                category: NodeType.ConstructorBodyContainer,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(type, constructor),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyBodyContainerKey(type, constructor),
                isGroup: true
            });
            createNodeForConstructorHeader(type, constructor);
            createNodeForConstructorBody(type, constructor);
        };
        const createNodesForConstructors = (type: Class | Struct) => {
            nodeData.push({
                category: NodeType.ConstructorsContainer,
                group: CodeDiagramHelper.typeKey(type),
                key: CodeDiagramHelper.constructorsContainerKey(type),
                isGroup: true
            });
            type.constructors.forEach(constructor => createNodeForConstructor(type, constructor));
        }
        // Create nodes for methods
        const createNodeForMethodHeader = (type: Class | Struct | Interface, method: Method) => {
            nodeData.push({
                category: NodeType.MethodHeader,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyHeaderContainerKey(type, method),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyHeaderKey(type, method),
                modifiers: method.modifiers,
                name: method.name,
                type: method.type,
                isGroup: true
            });
            method.parameters.forEach(parameter => createNodeForParameter(type, method, parameter, CodeDiagramHelper.isLastInCollection(method.parameters, parameter)));
        };
        const createNodeForMethodBody = (type: Class | Struct | Interface, method: Method) => {
            nodeData.push({
                category: NodeType.MethodBody,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyBodyContainerKey(type, method),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyBodyKey(type, method),
                isGroup: true
            });
            method.statements.forEach(statement => createNodeForStatement(type, method, statement));
        }
        const createNodeForMethod = (type: Class | Struct | Interface, method: Method) => {
            createMethodTypeLink(type, method);
            nodeData.push({
                category: NodeType.Method,
                group: CodeDiagramHelper.methodsContainerKey(type),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(type, method),
                isGroup: true
            });
            nodeData.push({
                category: NodeType.MethodHeaderContainer,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(type, method),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyHeaderContainerKey(type, method),
                isGroup: true
            });
            nodeData.push({
                category: NodeType.MethodBodyContainer,
                group: CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(type, method),
                key: CodeDiagramHelper.constructorOrMethodOrPropertyBodyContainerKey(type, method),
                isGroup: true
            });
            createNodeForMethodHeader(type, method);
            createNodeForMethodBody(type, method);
        };
        const createNodesForMethods = (type: Class | Struct | Interface) => {
            nodeData.push({
                category: NodeType.MethodsContainer,
                group: CodeDiagramHelper.typeKey(type),
                key: CodeDiagramHelper.methodsContainerKey(type),
                isGroup: true
            });
            type.methods.forEach(method => createNodeForMethod(type, method));
        }

        // Create nodes for Types (classes, structs, interfaces and enums)
        const mapType = (type: IType) => {
            createInheritanceLinks(type);
            return {
                key: CodeDiagramHelper.typeKey(type),
                modifiers: type.modifiers,
                name: type.name,
                isGroup: true
            };
        }
        const createNodesForClassOrStruct = (type: Class | Struct) => {
            nodeData.push({
                category: type instanceof Class? NodeType.Class: NodeType.Struct,
                ...mapType(type),
            });
            createNodesForFields(type);
            createNodesForProperties(type);
            createNodesForConstructors(type);
            createNodesForMethods(type);
        };
        const createNodesForInterface = (type: Interface) => {
            nodeData.push({
                category: NodeType.Interface,
                ...mapType(type),
            });
            createNodesForProperties(type);
        }
        const createNodesForEnum = (type: Enum) => {
            nodeData.push({
                category: NodeType.Enum,
                ...mapType(type)
            });
            createNodesForEnumValues(type);
        }

        props.types.filter(type => type instanceof Class).forEach(type => createNodesForClassOrStruct(type as Class));
        props.types.filter(type => type instanceof Struct).forEach(type => createNodesForClassOrStruct(type as Struct));
        props.types.filter(type => type instanceof Interface).forEach(type => createNodesForInterface(type as Interface));
        props.types.filter(type => type instanceof Enum).forEach(type => createNodesForEnum(type as Enum));

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
    private static findEnumInType(type: Enum, enumValueName: string): EnumValue | undefined {
        var value = type.values.find(value => value.name == enumValueName);
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
    // Create keys for enum values
    private static enumValuesContainerKey =
        (type: Enum) => `${CodeDiagramHelper.typeKey(type)}.Values`;
    private static enumValueKey =
        (type: Enum, value: EnumValue) => `${CodeDiagramHelper.typeKey(type)}.${value.index}`;
    // Create keys for fields and properties
    private static fieldsContainerKey =
        (type: Class | Struct) => `${CodeDiagramHelper.typeKey(type)}.Fields`;
    private static propertyContainerKey = 
        (type: Class | Struct | Interface) => `${CodeDiagramHelper.typeKey(type)}.Properties`;
    private static fieldOrPropertyKey = 
        (type: Class | Struct | Interface, fieldOrProperty: Field | Property) => 
        `${CodeDiagramHelper.typeKey(type)}.${CodeDiagramHelper.mapMemberTypeToString(fieldOrProperty)}.${fieldOrProperty.index}`;
    // Create keys for callables
    private static constructorsContainerKey =
        (type: Class | Struct | Interface) => `${CodeDiagramHelper.typeKey(type)}.Constructors`;
    private static methodsContainerKey =
        (type: Class | Struct | Interface) => `${CodeDiagramHelper.typeKey(type)}.Methods`;
    private static constructorOrMethodOrPropertyContainerKey = 
        (type: IType, callable: Constructor | Method | Property) => 
        `${CodeDiagramHelper.typeKey(type)}.${CodeDiagramHelper.mapMemberTypeToString(callable)}.${callable.index}:Container`;
    private static constructorOrMethodOrPropertyHeaderContainerKey =
        (type: IType, callable: Constructor | Method | Property) => `${CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(type, callable)}.HeaderContainer`;
    private static constructorOrMethodOrPropertyBodyContainerKey =
        (type: IType, callable: Constructor | Method | Property) => `${CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(type, callable)}.BodyContainer`;
    private static constructorOrMethodOrPropertyHeaderKey = 
        (type: IType, callable: Constructor | Method | Property) => `${CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(type, callable)}.Header`;
    private static constructorOrMethodOrPropertyBodyKey = 
        (type: IType, callable: Constructor | Method | Property) => `${CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(type, callable)}.Body`;
    // Create keys for parameters
    private static constructorOrMethodOrPropertyParameterKey = 
        (type: IType, callable: Constructor | Method | Property, parameter: FixedParameter) => `${CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(type, callable)}.${parameter.index}`;
    // Create keys for property accessors
    private static propertyAccessorKey = 
        (type: Class | Struct | Interface, property: Property, accessor: PropertyAccessor) => `${CodeDiagramHelper.fieldOrPropertyKey(type, property)}.${accessor.index}`;
    // Create keys for statements
    private static propertyAccessorStatementKey = 
        (type: Class | Struct | Interface, property: Property, accessor: PropertyAccessor, statement: Statement) => 
        `${CodeDiagramHelper.propertyAccessorKey(type, property, accessor)}:${statement.index}`;
    private static constructorOrMethodStatementKey = 
        (type: Class | Struct | Interface, constructor: Constructor | Method, statement: Statement) => 
        `${CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(type, constructor)}:${statement.index}`;
    
    // Creating and adding links
    private static addLink = (category: string, from: string, to: string, linkData: any) => {
        linkData.push({ key: linkData.length, category: category, from: from, to: to });
    }
    private static addLinkFromStatementToEnumValue (type: IType, fieldOrPropertyType: string, fieldOrPropertyName: string, statementKey: string, typesGroupedByNamespace: any, linkData: any) {
        var relevantType = CodeDiagramHelper.findTypeInRelevantNamespaces(type, fieldOrPropertyType, typesGroupedByNamespace);
        if (relevantType !== undefined && relevantType instanceof Enum) { // if parameter type is a customly defined one and an Enum
            var enumValueOfRelevantType = CodeDiagramHelper.findEnumInType(relevantType, fieldOrPropertyName);
            if (enumValueOfRelevantType !== undefined) {
                CodeDiagramHelper.addLink(
                    LinkType.StatementUsesEnumValue,
                    statementKey,
                    CodeDiagramHelper.enumValueKey(relevantType as Enum, enumValueOfRelevantType),
                    linkData);
            }
        }
    }
    private static addLinkFromStatementToFieldOrProperty (type: IType, fieldOrPropertyType: string, fieldOrPropertyName: string, statementKey: string, typesGroupedByNamespace: any, linkData: any) {
        var relevantType = CodeDiagramHelper.findTypeInRelevantNamespaces(type, fieldOrPropertyType, typesGroupedByNamespace);
        if (relevantType !== undefined) { // if parameter type is a customly defined one
            var fieldOrPropertyOfRelevantType = CodeDiagramHelper.findFieldOrPropertyInType(relevantType, fieldOrPropertyName);
            if (fieldOrPropertyOfRelevantType !== undefined) {
                CodeDiagramHelper.addLink(
                    LinkType.StatementUsesFieldOrProperty,
                    statementKey, 
                    CodeDiagramHelper.fieldOrPropertyKey(relevantType as Class | Struct | Interface, fieldOrPropertyOfRelevantType as Field | Property),
                    linkData);
            }
        }
    };
    private static addLinkFromStatementToConstructorOrMethod (type: IType, callableType: string, callableName: string, statementKey: string, typesGroupedByNamespace: any, linkData: any) {
        var relevantType = CodeDiagramHelper.findTypeInRelevantNamespaces(type, callableType, typesGroupedByNamespace);
        if (relevantType !== undefined) {
            var callable = CodeDiagramHelper.findConstructorOrMethodInType(relevantType, callableName);
            if (callable !== undefined) {
                CodeDiagramHelper.addLink(
                    LinkType.StatementUsesConstructorOrMethod,
                    statementKey,
                    CodeDiagramHelper.constructorOrMethodOrPropertyContainerKey(relevantType as Class | Struct, callable as Constructor | Method),
                    linkData
                )
            }
        }
    }
    private static addLinkFromStatementToType (type: IType, usedType: string, statementKey: string, typesGroupedByNamespace: any, linkData: any) {
        var relevantType = CodeDiagramHelper.findTypeInRelevantNamespaces(type, usedType, typesGroupedByNamespace);
        if (relevantType !== undefined) {
            CodeDiagramHelper.addLink(
                LinkType.StatementUsesType,
                statementKey,
                CodeDiagramHelper.typeKey(relevantType as IType),
                linkData
            );
        }
    }
    private static createParameterLinks (type: IType, parameterType: string, parameterKey: string, typesGroupedByNamespace: any, linkData: any) {
        var referencedType = CodeDiagramHelper.findTypeInRelevantNamespaces(type, parameterType, typesGroupedByNamespace);
        if (referencedType !== undefined) {
            CodeDiagramHelper.addLink(
                LinkType.ParameterType,
                parameterKey, 
                CodeDiagramHelper.typeKey(referencedType),
                linkData);
        }
    }
    private static createMethodTypeLink (type: Class | Struct | Interface, method: Method, typesGroupedByNamespace: any, linkData: any) {
        var returnType = CodeDiagramHelper.findTypeInRelevantNamespaces(type, method.type, typesGroupedByNamespace);
        if (returnType !== undefined) {
            CodeDiagramHelper.addLink(
                LinkType.CallableReturnType,
                CodeDiagramHelper.constructorOrMethodOrPropertyHeaderContainerKey(type, method),
                CodeDiagramHelper.typeKey(returnType as IType),
                linkData
            );
        }
    }
    private static createInheritanceLinks (type: IType, typesGroupedByNamespace: any, linkData: any) {
        type.parentInheritances.forEach((parentInheritance: string) => {
            var parent = CodeDiagramHelper.findTypeInRelevantNamespaces(type, parentInheritance, typesGroupedByNamespace);
            if (parent !== undefined) {
                CodeDiagramHelper.addLink(
                    parent instanceof Interface || parent.modifiers.includes("abstract")? LinkType.Realization: LinkType.Generalization,
                    CodeDiagramHelper.typeKey(type), 
                    CodeDiagramHelper.typeKey(parent), 
                    linkData);
            }
        });
    };
    private static createStatementLinks (type: IType, callable: Method | Constructor, statement: Statement, statementKey: string, typesGroupedByNamespace: any, linkData: any) {
        statement.usedFieldsAndProperties.forEach((fieldOrProperty: string) => {
            var fieldOrPropertyAtoms = fieldOrProperty.split('.'); // convention: fieldOrPropertyAtoms can have either 1 or 2 elements
            if (fieldOrPropertyAtoms.length > 1) { // if member access
                var parametersIndex = callable.parameters.findIndex(parameter => parameter.name == fieldOrPropertyAtoms[0]);
                var declaredVariablesIndex = callable.declaredVariables.findIndex(declaredVariable => declaredVariable.name == fieldOrPropertyAtoms[0]);
                if (parametersIndex !== -1) { // if type can be inferred from parameters
                    var parameter = callable.parameters[parametersIndex];
                    CodeDiagramHelper.addLinkFromStatementToFieldOrProperty(type, parameter.type, fieldOrPropertyAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                }
                else if (declaredVariablesIndex !== -1) { // if type can be inferred from declared variables
                    var declaredVariable = callable.declaredVariables[declaredVariablesIndex];
                    CodeDiagramHelper.addLinkFromStatementToFieldOrProperty(type, declaredVariable.type, fieldOrPropertyAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                }
                else { // if it is possibly a static member of a certain type
                    CodeDiagramHelper.addLinkFromStatementToFieldOrProperty(type, fieldOrPropertyAtoms[0], fieldOrPropertyAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                    CodeDiagramHelper.addLinkFromStatementToEnumValue(type, fieldOrPropertyAtoms[0], fieldOrPropertyAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                }
            }
            else { // if it refers to members present on the same type
                // TODO: for now, do not show links toward members present on the same type
                // CodeDiagramHelper.addLinkFromStatementToFieldOrProperty(type, type.name, fieldOrPropertyAtoms[0], statementKey, typesGroupedByNamespace, linkData);
            }
        });
        statement.usedConstructors.forEach((constructor: string) => { // Warning: currently, overloading is not supported
            var constructorAtoms = constructor.split('.'); // convention: constructor can have either 1 or 2 elements
            if (constructorAtoms.length > 1) { // if member access
                CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, constructorAtoms[1], constructorAtoms[1], statementKey, typesGroupedByNamespace, linkData);
            }
            else {
                CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, constructorAtoms[0], constructorAtoms[0], statementKey, typesGroupedByNamespace, linkData);
            }
        });
        statement.usedMethods.forEach((method: string) => { // Warning: currently, overloading is not supported
            var methodAtoms = method.split('.'); // convention: method can have either 1 or 2 elements
            if (methodAtoms.length > 1) { // if member access
                var parametersIndex = callable.parameters.findIndex(parameter => parameter.name == methodAtoms[0]);
                var declaredVariablesIndex = callable.declaredVariables.findIndex(declaredVariable => declaredVariable.name == methodAtoms[0]);
                if (parametersIndex !== -1) { // if type can be inferred from parameters
                    var parameter = callable.parameters[parametersIndex];
                    CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, parameter.type, methodAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                }
                else if (declaredVariablesIndex !== -1) { // if type can be inferred from declared variables
                    var declaredVariable = callable.declaredVariables[declaredVariablesIndex];
                    CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, declaredVariable.type, methodAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                }
                else { // if it is possibly a static member of a certain type
                    CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, methodAtoms[0], methodAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                }
            }
            else { // if it refers to members present on the same type
                // TODO: for now, do not show links toward members present on the same type
                // CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, type.name, method, statementKey, typesGroupedByNamespace, linkData);
            }
        });
        statement.usedTypes.forEach((usedType: string) => {
            // TODO: for now, do not show links toward types when no member of that type is used
            // CodeDiagramHelper.addLinkFromStatementToType(type, usedType, statementKey, typesGroupedByNamespace, linkData);
        });
    };
    static createPropertyAccessorStatementLinks(type: IType, property: Property, accessor: PropertyAccessor, statement: Statement, statementKey: string, typesGroupedByNamespace: any, linkData: any) {
        statement.usedFieldsAndProperties.forEach((fieldOrProperty: string) => {
            var fieldOrPropertyAtoms = fieldOrProperty.split('.'); // convention: fieldOrPropertyAtoms can have either 1 or 2 elements
            if (fieldOrPropertyAtoms.length > 1) { // if member access
                var parametersIndex = property.parameters.findIndex(parameter => parameter.name == fieldOrPropertyAtoms[0]);
                var declaredVariablesIndex = accessor.declaredVariables.findIndex(declaredVariable => declaredVariable.name == fieldOrPropertyAtoms[0]);
                if (parametersIndex !== -1) { // if type can be inferred from parameters
                    var parameter = property.parameters[parametersIndex];
                    CodeDiagramHelper.addLinkFromStatementToFieldOrProperty(type, parameter.type, fieldOrPropertyAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                }
                else if (declaredVariablesIndex !== -1) { // if type can be inferred from declared variables
                    var declaredVariable = accessor.declaredVariables[declaredVariablesIndex];
                    CodeDiagramHelper.addLinkFromStatementToFieldOrProperty(type, declaredVariable.type, fieldOrPropertyAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                }
                else { // if it is possibly a static member of a certain type
                    CodeDiagramHelper.addLinkFromStatementToFieldOrProperty(type, fieldOrPropertyAtoms[0], fieldOrPropertyAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                    CodeDiagramHelper.addLinkFromStatementToEnumValue(type, fieldOrPropertyAtoms[0], fieldOrPropertyAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                }
            }
            else { // if it refers to members present on the same type
                // TODO: for now, do not show links toward members present on the same type
                // CodeDiagramHelper.addLinkFromStatementToFieldOrProperty(type, type.name, fieldOrPropertyAtoms[0], statementKey, typesGroupedByNamespace, linkData);
            }
        });
        statement.usedConstructors.forEach((constructor: string) => { // Warning: currently, overloading is not supported
            var constructorAtoms = constructor.split('.'); // convention: constructor can have either 1 or 2 elements
            if (constructorAtoms.length > 1) { // if member access
                CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, constructorAtoms[1], constructorAtoms[1], statementKey, typesGroupedByNamespace, linkData);
            }
            else { // if it refers to members present on the same type
                // TODO: for now, do not show links toward members present on the same type
                // CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, constructorAtoms[0], constructorAtoms[0], statementKey, typesGroupedByNamespace, linkData);
            }
        });
        statement.usedMethods.forEach((method: string) => { // Warning: currently, overloading is not supported
            var methodAtoms = method.split('.'); // convention: method can have either 1 or 2 elements
            if (methodAtoms.length > 1) { // if member access
                var parametersIndex = property.parameters.findIndex(parameter => parameter.name == methodAtoms[0]);
                var declaredVariablesIndex = accessor.declaredVariables.findIndex(declaredVariable => declaredVariable.name == methodAtoms[0]);
                if (parametersIndex !== -1) { // if type can be inferred from parameters
                    var parameter = property.parameters[parametersIndex];
                    CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, parameter.type, methodAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                }
                else if (declaredVariablesIndex !== -1) { // if type can be inferred from declared variables
                    var declaredVariable = accessor.declaredVariables[declaredVariablesIndex];
                    CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, declaredVariable.type, methodAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                }
                else { // if it is possibly a static member of a certain type
                    CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, methodAtoms[0], methodAtoms[1], statementKey, typesGroupedByNamespace, linkData);
                }
            }
            else { // if it refers to members present on the same type
                // TODO: for now, do not show links toward members present on the same type
                // CodeDiagramHelper.addLinkFromStatementToConstructorOrMethod(type, type.name, method, statementKey, typesGroupedByNamespace, linkData);
            }
        });
        statement.usedTypes.forEach((usedType: string) => {
            // TODO: for now, do not show links toward types when no member of that type is used
            // CodeDiagramHelper.addLinkFromStatementToType(type, usedType, statementKey, typesGroupedByNamespace, linkData);
        });
    }

    // Helper functions
    private static isLastInCollection = (collection: any[], item: any) => collection.indexOf(item) === collection.length - 1;
    private static mapStatementToStatementAtoms = (statement: Statement | undefined): any[] => {
        if (statement === undefined) return [];
        var delimiters = ['using', 'namespace', 'class', 'new', 'public', 'protected', 
        'internal', 'private', 'static', 'virtual', 'sealed', 'override', 'abstract', 
        'extern', 'readonly', 'volatile', 'get', 'set', 'ref', 'out', 'this', 'base', 
        'true', 'false', 'null', 'is', 'as', 'if', 'else', 'while', 'do', 'for', 
        'foreach', 'in', 'try', 'catch', 'finally', 'throw', 'return', 'struct', 
        'interface', 'enum']
        .concat(statement.usedFieldsAndProperties.concat(statement.usedConstructors.concat(statement.usedMethods.concat(statement.usedTypes))));
        var statementAtoms = statement.statementText.split(new RegExp(`(${delimiters.join('|')})`, 'g')).filter(x => x !== "");
        return statementAtoms.map(atom => {
            return {
                text: atom.trim(),
                semantic: CodeDiagramHelper.mapStatementAtomToSemantic(atom, statement)
            }
        });
    }
    private static mapStatementAtomToSemantic = (atom: string, statement: Statement): string => {
        switch (true) {
            case (statement.usedFieldsAndProperties.indexOf(atom) !== -1):
                return StatementAtomSemantic.FieldOrProperty;
            case (statement.usedConstructors.indexOf(atom) !== -1):
                return StatementAtomSemantic.Constructor;
            case (statement.usedMethods.indexOf(atom) !== -1):
                return StatementAtomSemantic.Method;
            case (statement.usedTypes.indexOf(atom) !== -1):
                return StatementAtomSemantic.Type;
            default:
                return StatementAtomSemantic.Other;
        }
    }
    private static mapMemberTypeToString = (member: Field | Property | Constructor | Method): string => {
        switch (member.constructor) {
            case (Field): return "Field";
            case (Property): return "Property";
            case (Constructor): return "Constructor";
            case (Method): return "Method";
        }
        return "Unknown";
    }
}
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
import { DeclaredVariable } from '../../codeModel/Misc/DeclaredVariable';

import { LinkCreationConfiguration } from './CodeDiagramConfiguration';

export class CodeDiagramDataMapper {
    private types: IType[];
    private typesGroupedByNamespace: any;
    private linkCreationConfiguration: LinkCreationConfiguration;

    private nodeData: any[];
    private linkData: any[];

    public constructor(types: IType[], linkCreationConfiguration: LinkCreationConfiguration) {
        this.types = types;
        this.typesGroupedByNamespace = this.groupTypesByProperty('namespace');
        this.linkCreationConfiguration = linkCreationConfiguration

        this.nodeData = [];
        this.linkData = [];
    }

    public ComputeNodeAndLinkData(): {nodeDataArray: any[], linkDataArray: any[]} {
        // Create nodes for enum values
        const createNodeForEnumValue = (type: Enum, value: EnumValue) => {
            this.nodeData.push({
                category: NodeType.EnumValue,
                group: this.enumValuesContainerKey(type),
                key: this.enumValueKey(type, value),
                value: value.name
            });
        };
        const createNodesForEnumValues = (type: Enum) => {
            this.nodeData.push({
                category: NodeType.EnumValuesContainer,
                group: this.typeKey(type),
                key: this.enumValuesContainerKey(type),
                isGroup: true
            });
            type.values.forEach(value => createNodeForEnumValue(type, value));
        }
        // Create nodes for fields
        const createNodeForField = (type: Class | Struct, field: Field) => {
            this.createMemberTypeLink(type, field);
            var statementAtoms = this.mapStatementToStatementAtoms(field.assignmentStatement);
            this.nodeData.push({
                category: NodeType.Field,
                group: this.fieldsContainerKey(type),
                key: this.fieldOrPropertyKey(type, field),
                modifiers: field.modifiers,
                name: field.name,
                type: field.type,
                statementAtoms: statementAtoms
            });
        };
        const createNodesForFields = (type: Class | Struct) => {
            this.nodeData.push({
                category: NodeType.FieldsContainer,
                group: this.typeKey(type),
                key: this.fieldsContainerKey(type),
                isGroup: true
            });
            type.fields.forEach(field => createNodeForField(type, field));
        }
        // Create nodes for parameters
        const createNodeForParameter = (type: Class | Struct | Interface, callable: Method | Constructor | Property, parameter: FixedParameter, isLast: boolean) => {
            var parameterKey = this.constructorOrMethodOrPropertyParameterKey(type, callable, parameter);
            this.createParameterLinks(type, parameter.type, parameterKey);
            var statementAtoms = this.mapStatementToStatementAtoms(parameter.assignmentStatement);
            this.nodeData.push({
                category: NodeType.Parameter,
                group: this.constructorOrMethodOrPropertyHeaderKey(type, callable),
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
            var statementKey = this.constructorOrMethodStatementKey(type, callable, statement);
            this.createStatementLinks(type, callable.parameters, callable.declaredVariables, statement, statementKey);
            var statementAtoms = this.mapStatementToStatementAtoms(statement);
            this.nodeData.push({
                category: NodeType.Statement,
                group: this.constructorOrMethodOrPropertyBodyKey(type, callable),
                key: statementKey,
                statementAtoms: statementAtoms,
                blockCount: statement.blockCount
            });
        };
        const createNodeForPropertyAccessorStatement = (type: Class | Struct | Interface, property: Property, accessor: PropertyAccessor, statement: Statement) => {
            var statementKey = this.propertyAccessorStatementKey(type, property, accessor, statement);
            this.createStatementLinks(type, property.parameters, accessor.declaredVariables, statement, statementKey);
            var statementAtoms = this.mapStatementToStatementAtoms(statement);
            this.nodeData.push({
                category: NodeType.Statement,
                group: this.propertyAccessorKey(type, property, accessor),
                key: statementKey,
                statementAtoms: statementAtoms,
                blockCount: statement.blockCount
            });
        };
        // Create nodes for property accessor
        const createNodeForAccesor = (type: Class | Struct | Interface, property: Property, accessor: PropertyAccessor) => {
            this.nodeData.push({
                category: NodeType.PropertyAccessor,
                group: this.constructorOrMethodOrPropertyBodyKey(type, property),
                key: this.propertyAccessorKey(type, property, accessor),
                name: accessor.name,
                isGroup: true
            });
            accessor.body.forEach(statement => createNodeForPropertyAccessorStatement(type, property, accessor, statement));
        }
        // Create nodes for properties
        const createNodeForPropertyHeader = (type: Class | Struct | Interface, property: Property) => {
            this.createMemberTypeLink(type, property);
            var statementAtoms = this.mapStatementToStatementAtoms(property.assignmentStatement);
            this.nodeData.push({
                category: NodeType.PropertyHeader,
                group: this.constructorOrMethodOrPropertyHeaderContainerKey(type, property),
                key: this.constructorOrMethodOrPropertyHeaderKey(type, property),
                modifiers: property.modifiers,
                name: property.name,
                type: property.type,
                statementAtoms: statementAtoms,
                isGroup: true
            });
            property.parameters.forEach(parameter => createNodeForParameter(type, property, parameter, this.isLastInCollection(property.parameters, parameter)));
        };
        const createNodeForPropertyBody = (type: Class | Struct | Interface, property: Property) => {
            this.nodeData.push({
                category: NodeType.PropertyBody,
                group: this.constructorOrMethodOrPropertyBodyContainerKey(type, property),
                key: this.constructorOrMethodOrPropertyBodyKey(type, property),
                isGroup: true
            });
            property.accessors.forEach(accessor => createNodeForAccesor(type, property, accessor));
        }
        const createNodeForProperty = (type: Class | Struct | Interface, property: Property) => {
            this.nodeData.push({
                category: NodeType.Property,
                group: this.propertyContainerKey(type),
                key: this.fieldOrPropertyKey(type, property),
                isGroup: true
            });
            this.nodeData.push({
                category: NodeType.PropertyHeaderContainer,
                group: this.fieldOrPropertyKey(type, property),
                key: this.constructorOrMethodOrPropertyHeaderContainerKey(type, property),
                isGroup: true
            });
            this.nodeData.push({
                category: NodeType.PropertyBodyContainer,
                group: this.fieldOrPropertyKey(type, property),
                key: this.constructorOrMethodOrPropertyBodyContainerKey(type, property),
                isGroup: true
            });
            createNodeForPropertyHeader(type, property);
            createNodeForPropertyBody(type, property);
        };
        const createNodesForProperties = (type: Class | Struct | Interface) => {
            this.nodeData.push({
                category: NodeType.PropertiesContainer,
                group: this.typeKey(type),
                key: this.propertyContainerKey(type),
                isGroup: true
            });
            type.properties.forEach(property => createNodeForProperty(type, property));
        }
        // Create nodes for constructors
        const createNodeForConstructorHeader = (type: Class | Struct | Interface, constructor: Constructor) => {
            this.nodeData.push({
                category: NodeType.ConstructorHeader,
                group: this.constructorOrMethodOrPropertyHeaderContainerKey(type, constructor),
                key: this.constructorOrMethodOrPropertyHeaderKey(type, constructor),
                modifiers: constructor.modifiers,
                name: constructor.name,
                isGroup: true
            });
            constructor.parameters.forEach(parameter => createNodeForParameter(type, constructor, parameter, this.isLastInCollection(constructor.parameters, parameter)));
        };
        const createNodeForConstructorBody = (type: Class | Struct | Interface, constructor: Constructor) => {
            this.nodeData.push({
                category: NodeType.ConstructorBody,
                group: this.constructorOrMethodOrPropertyBodyContainerKey(type, constructor),
                key: this.constructorOrMethodOrPropertyBodyKey(type, constructor),
                isGroup: true
            });
            constructor.statements.forEach(statement => createNodeForStatement(type, constructor, statement));
        }
        const createNodeForConstructor = (type: Class | Struct | Interface, constructor: Constructor) => {
            this.nodeData.push({
                category: NodeType.Constructor,
                group: this.constructorsContainerKey(type),
                key: this.constructorOrMethodOrPropertyContainerKey(type, constructor),
                isGroup: true
            });
            this.nodeData.push({
                category: NodeType.ConstructorHeaderContainer,
                group: this.constructorOrMethodOrPropertyContainerKey(type, constructor),
                key: this.constructorOrMethodOrPropertyHeaderContainerKey(type, constructor),
                isGroup: true
            });
            this.nodeData.push({
                category: NodeType.ConstructorBodyContainer,
                group: this.constructorOrMethodOrPropertyContainerKey(type, constructor),
                key: this.constructorOrMethodOrPropertyBodyContainerKey(type, constructor),
                isGroup: true
            });
            createNodeForConstructorHeader(type, constructor);
            createNodeForConstructorBody(type, constructor);
        };
        const createNodesForConstructors = (type: Class | Struct) => {
            this.nodeData.push({
                category: NodeType.ConstructorsContainer,
                group: this.typeKey(type),
                key: this.constructorsContainerKey(type),
                isGroup: true
            });
            type.constructors.forEach(constructor => createNodeForConstructor(type, constructor));
        }
        // Create nodes for methods
        const createNodeForMethodHeader = (type: Class | Struct | Interface, method: Method) => {
            this.nodeData.push({
                category: NodeType.MethodHeader,
                group: this.constructorOrMethodOrPropertyHeaderContainerKey(type, method),
                key: this.constructorOrMethodOrPropertyHeaderKey(type, method),
                modifiers: method.modifiers,
                name: method.name,
                type: method.type,
                isGroup: true
            });
            method.parameters.forEach(parameter => createNodeForParameter(type, method, parameter, this.isLastInCollection(method.parameters, parameter)));
        };
        const createNodeForMethodBody = (type: Class | Struct | Interface, method: Method) => {
            this.nodeData.push({
                category: NodeType.MethodBody,
                group: this.constructorOrMethodOrPropertyBodyContainerKey(type, method),
                key: this.constructorOrMethodOrPropertyBodyKey(type, method),
                isGroup: true
            });
            method.statements.forEach(statement => createNodeForStatement(type, method, statement));
        }
        const createNodeForMethod = (type: Class | Struct | Interface, method: Method) => {
            this.createMemberTypeLink(type, method);
            this.nodeData.push({
                category: NodeType.Method,
                group: this.methodsContainerKey(type),
                key: this.constructorOrMethodOrPropertyContainerKey(type, method),
                isGroup: true
            });
            this.nodeData.push({
                category: NodeType.MethodHeaderContainer,
                group: this.constructorOrMethodOrPropertyContainerKey(type, method),
                key: this.constructorOrMethodOrPropertyHeaderContainerKey(type, method),
                isGroup: true
            });
            this.nodeData.push({
                category: NodeType.MethodBodyContainer,
                group: this.constructorOrMethodOrPropertyContainerKey(type, method),
                key: this.constructorOrMethodOrPropertyBodyContainerKey(type, method),
                isGroup: true
            });
            createNodeForMethodHeader(type, method);
            createNodeForMethodBody(type, method);
        };
        const createNodesForMethods = (type: Class | Struct | Interface) => {
            this.nodeData.push({
                category: NodeType.MethodsContainer,
                group: this.typeKey(type),
                key: this.methodsContainerKey(type),
                isGroup: true
            });
            type.methods.forEach(method => createNodeForMethod(type, method));
        }

        // Create nodes for Types (classes, structs, interfaces and enums)
        const mapType = (type: IType) => {
            this.createInheritanceLinks(type);
            return {
                key: this.typeKey(type),
                modifiers: type.modifiers,
                name: type.name,
                isGroup: true
            };
        }
        const createNodesForClassOrStruct = (type: Class | Struct) => {
            this.nodeData.push({
                category: type instanceof Class? NodeType.Class: NodeType.Struct,
                ...mapType(type),
            });
            createNodesForFields(type);
            createNodesForProperties(type);
            createNodesForConstructors(type);
            createNodesForMethods(type);
        };
        const createNodesForInterface = (type: Interface) => {
            this.nodeData.push({
                category: NodeType.Interface,
                ...mapType(type),
            });
            createNodesForProperties(type);
        }
        const createNodesForEnum = (type: Enum) => {
            this.nodeData.push({
                category: NodeType.Enum,
                ...mapType(type)
            });
            createNodesForEnumValues(type);
        }
        
        this.types.filter(type => type instanceof Class).forEach(type => createNodesForClassOrStruct(type as Class));
        this.types.filter(type => type instanceof Struct).forEach(type => createNodesForClassOrStruct(type as Struct));
        this.types.filter(type => type instanceof Interface).forEach(type => createNodesForInterface(type as Interface));
        this.types.filter(type => type instanceof Enum).forEach(type => createNodesForEnum(type as Enum));

        return {
            nodeDataArray: this.nodeData,
            linkDataArray: this.linkData
        };
    }



    // helper functions for finding types and members
    private groupTypesByProperty (key: any): any {
        return this.types.reduce(function (rv: any, x: any) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };
    private findTypeInRelevantNamespaces (type: IType, typeName: string): IType | undefined {
        var namespaces = type.namespaceDependecies.concat([type.namespace]);
        for (let namespace of namespaces) {
            var relevantNamespace = this.typesGroupedByNamespace[namespace];
            if (relevantNamespace !== undefined) {
                var otherType = relevantNamespace.find((other: IType) => other.name == typeName);
                if (otherType !== undefined) return otherType;
            }
        }
    };
    private findEnumValueInType(type: Enum, enumValueName: string): EnumValue | undefined {
        var value = type.values.find(value => value.name == enumValueName);
        if (value !== undefined) return value;
    };
    private findFieldOrPropertyInType (type: IType | null, fieldOrPropertyName: string): Field | Property | undefined {
        if (type instanceof Class || type instanceof Struct) {
            var field = type.fields.find(field => field.name == fieldOrPropertyName);
            if (field !== undefined) return field;
        }
        if (type instanceof Class || type instanceof Struct || type instanceof Interface) {
            var property = type.properties.find(property => property.name == fieldOrPropertyName);
            if (property !== undefined) return property;
        }
    };
    private findConstructorOrMethodInType (type: IType | null, callableName: string): Constructor | Method | undefined {
        if (type instanceof Class || type instanceof Struct) {
            var constructor = type.constructors.find(constructor => constructor.name == callableName);
            if (constructor !== undefined) return constructor;
        }
        if (type instanceof Class || type instanceof Struct || type instanceof Interface) {
            var method = type.methods.find(method => method.name == callableName);
            if (method !== undefined) return method;
        }
    };

    // Create keys for types and type members
    private typeKey = 
        (type: IType) => `${type.namespace}.${type.name}`;
    // Create keys for enum values
    private enumValuesContainerKey =
        (type: Enum) => `${this.typeKey(type)}.Values`;
    private enumValueKey =
        (type: Enum, value: EnumValue) => `${this.typeKey(type)}.${value.index}`;
    // Create keys for fields and properties
    private fieldsContainerKey =
        (type: Class | Struct) => `${this.typeKey(type)}.Fields`;
    private propertyContainerKey = 
        (type: Class | Struct | Interface) => `${this.typeKey(type)}.Properties`;
    private fieldOrPropertyKey = 
        (type: Class | Struct | Interface, fieldOrProperty: Field | Property) => 
        `${this.typeKey(type)}.${this.mapMemberTypeToString(fieldOrProperty)}.${fieldOrProperty.index}`;
    // Create keys for callables
    private constructorsContainerKey =
        (type: Class | Struct | Interface) => `${this.typeKey(type)}.Constructors`;
    private methodsContainerKey =
        (type: Class | Struct | Interface) => `${this.typeKey(type)}.Methods`;
    private constructorOrMethodOrPropertyContainerKey = 
        (type: IType, callable: Constructor | Method | Property) => 
        `${this.typeKey(type)}.${this.mapMemberTypeToString(callable)}.${callable.index}:Container`;
    private constructorOrMethodOrPropertyHeaderContainerKey =
        (type: IType, callable: Constructor | Method | Property) => `${this.constructorOrMethodOrPropertyContainerKey(type, callable)}.HeaderContainer`;
    private constructorOrMethodOrPropertyBodyContainerKey =
        (type: IType, callable: Constructor | Method | Property) => `${this.constructorOrMethodOrPropertyContainerKey(type, callable)}.BodyContainer`;
    private constructorOrMethodOrPropertyHeaderKey = 
        (type: IType, callable: Constructor | Method | Property) => `${this.constructorOrMethodOrPropertyContainerKey(type, callable)}.Header`;
    private constructorOrMethodOrPropertyBodyKey = 
        (type: IType, callable: Constructor | Method | Property) => `${this.constructorOrMethodOrPropertyContainerKey(type, callable)}.Body`;
    // Create keys for parameters
    private constructorOrMethodOrPropertyParameterKey = 
        (type: IType, callable: Constructor | Method | Property, parameter: FixedParameter) => `${this.constructorOrMethodOrPropertyContainerKey(type, callable)}.${parameter.index}`;
    // Create keys for property accessors
    private propertyAccessorKey = 
        (type: Class | Struct | Interface, property: Property, accessor: PropertyAccessor) => `${this.fieldOrPropertyKey(type, property)}.${accessor.index}`;
    // Create keys for statements
    private propertyAccessorStatementKey = 
        (type: Class | Struct | Interface, property: Property, accessor: PropertyAccessor, statement: Statement) => 
        `${this.propertyAccessorKey(type, property, accessor)}:${statement.index}`;
    private constructorOrMethodStatementKey = 
        (type: Class | Struct | Interface, constructor: Constructor | Method, statement: Statement) => 
        `${this.constructorOrMethodOrPropertyContainerKey(type, constructor)}:${statement.index}`;
    
    // Creating and adding links
    private addLink = (category: string, from: string, to: string) => {
        switch (category) {
            case (LinkType.Realization || LinkType.Generalization): if (!this.linkCreationConfiguration.inheritance) return; break;
            case (LinkType.MemberType): if (!this.linkCreationConfiguration.memberType) return; break;
            case (LinkType.ParameterType): if (!this.linkCreationConfiguration.parameterType) return; break;
            case (LinkType.StatementUsesType): if (!this.linkCreationConfiguration.variableDeclarationType) return; break;
            case (LinkType.StatementUsesConstructorOrMethod): if (!this.linkCreationConfiguration.usedConstructorsAndMethods) return; break;
            case (LinkType.StatementUsesFieldOrProperty): if (!this.linkCreationConfiguration.usedFieldAndProperties) return; break;
            case (LinkType.StatementUsesEnumValue): if (!this.linkCreationConfiguration.usedEnumValues) return; break;
        }
        this.linkData.push({ key: this.linkData.length, category: category, from: from, to: to });
    }
    private addLinkFromStatementToEnumValue (type: IType, enumType: string, enumValueName: string, statementKey: string) {
        var relevantType = this.findTypeInRelevantNamespaces(type, enumType);
        if (relevantType !== undefined && relevantType instanceof Enum) { // if parameter type is a customly defined one and an Enum
            if (this.linkRefersToSameTypeAndIsNotAllowed(type, relevantType)) return;
            var enumValueOfRelevantType = this.findEnumValueInType(relevantType, enumValueName);
            if (enumValueOfRelevantType !== undefined) {
                this.addLink(
                    LinkType.StatementUsesEnumValue,
                    statementKey,
                    this.enumValueKey(relevantType as Enum, enumValueOfRelevantType)
                );
            }
        }
    }
    private addLinkFromStatementToFieldOrProperty (type: IType, fieldOrPropertyType: string, fieldOrPropertyName: string, statementKey: string) {
        var relevantType = this.findTypeInRelevantNamespaces(type, fieldOrPropertyType);
        if (relevantType !== undefined) { // if parameter type is a customly defined one
            if (this.linkRefersToSameTypeAndIsNotAllowed(type, relevantType)) return;
            var fieldOrPropertyOfRelevantType = this.findFieldOrPropertyInType(relevantType, fieldOrPropertyName);
            if (fieldOrPropertyOfRelevantType !== undefined) {
                this.addLink(
                    LinkType.StatementUsesFieldOrProperty,
                    statementKey, 
                    this.fieldOrPropertyKey(relevantType as Class | Struct | Interface, fieldOrPropertyOfRelevantType as Field | Property)
                );
            }
        }
    };
    private addLinkFromStatementToConstructorOrMethod (type: IType, callableType: string, callableName: string, statementKey: string) {
        var relevantType = this.findTypeInRelevantNamespaces(type, callableType);
        if (relevantType !== undefined) {
            if (this.linkRefersToSameTypeAndIsNotAllowed(type, relevantType)) return;
            var callable = this.findConstructorOrMethodInType(relevantType, callableName);
            if (callable !== undefined) {
                this.addLink(
                    LinkType.StatementUsesConstructorOrMethod,
                    statementKey,
                    this.constructorOrMethodOrPropertyContainerKey(relevantType as Class | Struct, callable as Constructor | Method)
                );
            }
        }
    }
    private addLinkFromStatementToType (type: IType, usedType: string, statementKey: string) {
        var relevantType = this.findTypeInRelevantNamespaces(type, usedType);
        if (relevantType !== undefined) {
            if (this.linkRefersToSameTypeAndIsNotAllowed(type, relevantType)) return;
            this.addLink(
                LinkType.StatementUsesType,
                statementKey,
                this.typeKey(relevantType as IType)
            );
        }
    }
    // parameter links
    private createParameterLinks (type: IType, parameterType: string, parameterKey: string) {
        var referencedType = this.findTypeInRelevantNamespaces(type, parameterType);
        if (referencedType !== undefined) {
            if (this.linkRefersToSameTypeAndIsNotAllowed(type, referencedType)) return;
            this.addLink(
                LinkType.ParameterType,
                parameterKey, 
                this.typeKey(referencedType)
            );
        }
    }
    // statement links
    private createStatementLinks (type: IType, parameters: FixedParameter[], declaredVariables: DeclaredVariable[], statement: Statement, statementKey: string) {
        statement.usedFieldsAndProperties.forEach((fieldOrProperty: string) => {
            var fieldOrPropertyAtoms = fieldOrProperty.split('.'); // convention: fieldOrPropertyAtoms can have either 1 or 2 elements
            if (fieldOrPropertyAtoms.length > 1) { // if member access
                var parametersIndex = parameters.findIndex(parameter => parameter.name == fieldOrPropertyAtoms[0]);
                var declaredVariablesIndex = declaredVariables.findIndex(declaredVariable => declaredVariable.name == fieldOrPropertyAtoms[0]);
                if (parametersIndex !== -1) { // if type can be inferred from parameters
                    var parameter = parameters[parametersIndex];
                    this.addLinkFromStatementToFieldOrProperty(type, parameter.type, fieldOrPropertyAtoms[1], statementKey);
                }
                else if (declaredVariablesIndex !== -1) { // if type can be inferred from declared variables
                    var declaredVariable = declaredVariables[declaredVariablesIndex];
                    this.addLinkFromStatementToFieldOrProperty(type, declaredVariable.type, fieldOrPropertyAtoms[1], statementKey);
                }
                else { // if it is possibly a member of a certain type
                    this.addLinkFromStatementToFieldOrProperty(type, fieldOrPropertyAtoms[0], fieldOrPropertyAtoms[1], statementKey);
                    this.addLinkFromStatementToEnumValue(type, fieldOrPropertyAtoms[0], fieldOrPropertyAtoms[1], statementKey);
                }
            }
            else { // if it refers to members present on the same type
                this.addLinkFromStatementToFieldOrProperty(type, type.name, fieldOrPropertyAtoms[0], statementKey);
            }
        });
        statement.usedConstructors.forEach((constructor: string) => { // Warning: currently, overloading is not supported
            var constructorAtoms = constructor.split('.'); // convention: constructor can have either 1 or 2 elements
            if (constructorAtoms.length > 1) { // if member access
                this.addLinkFromStatementToConstructorOrMethod(type, constructorAtoms[1], constructorAtoms[1], statementKey);
            }
            else {
                this.addLinkFromStatementToConstructorOrMethod(type, constructorAtoms[0], constructorAtoms[0], statementKey);
            }
        });
        statement.usedMethods.forEach((method: string) => { // Warning: currently, overloading is not supported
            var methodAtoms = method.split('.'); // convention: method can have either 1 or 2 elements
            if (methodAtoms.length > 1) { // if member access
                var parametersIndex = parameters.findIndex(parameter => parameter.name == methodAtoms[0]);
                var declaredVariablesIndex = declaredVariables.findIndex(declaredVariable => declaredVariable.name == methodAtoms[0]);
                if (parametersIndex !== -1) { // if type can be inferred from parameters
                    var parameter = parameters[parametersIndex];
                    this.addLinkFromStatementToConstructorOrMethod(type, parameter.type, methodAtoms[1], statementKey);
                }
                else if (declaredVariablesIndex !== -1) { // if type can be inferred from declared variables
                    var declaredVariable = declaredVariables[declaredVariablesIndex];
                    this.addLinkFromStatementToConstructorOrMethod(type, declaredVariable.type, methodAtoms[1], statementKey);
                }
                else { // if it is possibly a member of a certain type
                    this.addLinkFromStatementToConstructorOrMethod(type, methodAtoms[0], methodAtoms[1], statementKey);
                }
            }
            else { // if it refers to members present on the same type
                this.addLinkFromStatementToConstructorOrMethod(type, type.name, method, statementKey);
            }
        });
        statement.usedTypes.forEach((usedType: string) => {
            this.addLinkFromStatementToType(type, usedType, statementKey);
        });
    };
    // member types links
    private createMemberTypeLink (type: Class | Struct | Interface, member: Field | Property | Method) {
        var returnType = this.findTypeInRelevantNamespaces(type, member.type);
        if (returnType !== undefined) {
            if (this.linkRefersToSameTypeAndIsNotAllowed(type, returnType)) return;
            this.addLink(
                LinkType.MemberType,
                member instanceof Field 
                    ? this.fieldOrPropertyKey(type, member as Field) 
                    : this.constructorOrMethodOrPropertyHeaderContainerKey(type, member),
                this.typeKey(returnType as IType)
            );
        }
    }
    // inheritance links
    private createInheritanceLinks (type: IType) {
        type.parentInheritances.forEach((parentInheritance: string) => {
            var parent = this.findTypeInRelevantNamespaces(type, parentInheritance);
            if (parent !== undefined) {
                this.addLink(
                    parent instanceof Interface || parent.modifiers.includes("abstract")? LinkType.Realization: LinkType.Generalization,
                    this.typeKey(type), 
                    this.typeKey(parent)
                );
            }
        });
    };

    // Helper functions
    private isLastInCollection = (collection: any[], item: any) => collection.indexOf(item) === collection.length - 1;
    private mapStatementToStatementAtoms = (statement: Statement | undefined): any[] => {
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
                semantic: this.mapStatementAtomToSemantic(atom, statement)
            }
        });
    }
    private mapStatementAtomToSemantic = (atom: string, statement: Statement): string => {
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
    private mapMemberTypeToString = (member: Field | Property | Constructor | Method): string => {
        switch (member.constructor) {
            case (Field): return "Field";
            case (Property): return "Property";
            case (Constructor): return "Constructor";
            case (Method): return "Method";
        }
        return "Unknown";
    }
    private linkRefersToSameTypeAndIsNotAllowed = (type: IType, otherType: IType): boolean => {
        return this.linkCreationConfiguration.linksToSameType === false && type.name === otherType.name;
    }
}
import * as go from 'gojs';
import * as React from 'react';

import { CodeDiagramWrapper } from './CodeDiagramWrapper'
import { IType } from '../../codeModel/Types/IType'
import { Class } from '../../codeModel/Types/Class';

import { parsedTypes } from './typesExample';

interface CodeDiagramState {
    nodeDataArray: Array<go.ObjectData>;
    linkDataArray: Array<go.ObjectData>;
    modelData: go.ObjectData;
    skipsDiagramUpdate: boolean;
}

interface CodeDiagramProps {
    types: IType[]
}

export class CodeDiagram extends React.Component<CodeDiagramProps, CodeDiagramState> {
    private mapNodeKeyIndex: Map<go.Key, number>;
    private mapLinkKeyIndex: Map<go.Key, number>;

    constructor(props: CodeDiagramProps) {
        super(props);

        var parsedClasses = parsedTypes as Class[];
        var nodeData = parsedClasses//this.props.types
            .map(type => type as Class)
            .map(type => {
                var fullyQualifiedName = `${type.namespace}.${type.name}`;
                return {
                    // skip sourceFilePath - for now we only support the readonly model
                    // skip namespaceDependencies - for now we only show classes, structs, interfaces and enums - may show namespaces in the future
                    key: fullyQualifiedName,
                    modifiers: type.modifiers,
                    name: type.name,
                    outPortId: `${fullyQualifiedName}.out`,
                    // skip parent inheritances -> will use these for links
                    fields: type.fields.map(field => {
                        return {
                            modifiers: field.modifiers,
                            name: field.name,
                            type: field.type,
                            inPortId: `${fullyQualifiedName}.${field.name}.in`
                        };
                    }),
                    properties: type.properties.map(property => {
                        return {
                            modifiers: property.modifiers,
                            name: property.name,
                            type: property.type,
                            accessors: property.accessors.map(accessor => {
                                return {
                                    type: accessor.type,
                                    body: accessor.body.map(statement => {
                                        return {
                                            statementText: statement.statementText,
                                            outPortId: `${fullyQualifiedName}.${property.name}.${statement.statementText}.out`
                                            // skip used fields, properties, constructors and methods -> will use these for links,
                                        };
                                    })
                                };
                            }),
                            inPortId: `${fullyQualifiedName}.${property.name}.in`
                        };
                    }),
                    constructors: type.constructors.map(constructor => {
                        return {
                            modifiers: constructor.modifiers,
                            name: constructor.name,
                            parameters: constructor.parameters.map(parameter => {
                                return {
                                    modifier: parameter.modifier,
                                    name: parameter.name,
                                    type: parameter.type
                                };
                            }),
                            // skip declared variables -> will use these for links
                            statements: constructor.statements.map(statement => {
                                return {
                                    statementText: statement.statementText,
                                    outPortId: `${fullyQualifiedName}.${constructor.name}.${statement.statementText}.out`
                                    // skip used fields, properties, constructors and methods -> will use these for links
                                };
                            }),
                            inPortId: `${fullyQualifiedName}.${constructor.name}.in`,
                            outPortId: `${fullyQualifiedName}.${constructor.name}.out`
                        };
                    }),
                    methods: type.methods.map(method => {
                        return {
                            modifiers: method.modifiers,
                            name: method.name,
                            type: method.type,
                            parameters: method.parameters.map(parameter => {
                                return {
                                    modifier: parameter.modifier,
                                    name: parameter.name,
                                    type: parameter.type
                                };
                            }),
                            // skip declared variables -> will use these for links
                            statements: method.statements.map(statement => {
                                return {
                                    statementText: statement.statementText,
                                    outPortId: `${fullyQualifiedName}.${method.name}.${statement.statementText}.out`
                                    // skip used fields, properties, constructors and methods -> will use these for links
                                };
                            }),
                            inPortId: `${fullyQualifiedName}.${method.name}.in`,
                            outPortId: `${fullyQualifiedName}.${method.name}.out`
                        };
                    })
                };
            });

        this.state = {
            nodeDataArray: nodeData,
            linkDataArray: [
            ],
            modelData: {},
            skipsDiagramUpdate: true
        };

        this.mapNodeKeyIndex = new Map<go.Key, number>();
        this.mapLinkKeyIndex = new Map<go.Key, number>();
        this.refreshNodeIndex(this.state.nodeDataArray);
        this.refreshLinkIndex(this.state.linkDataArray);
    }

    private refreshNodeIndex(nodeArray: Array<go.ObjectData>) {
        this.mapNodeKeyIndex.clear();
        nodeArray.forEach((node: go.ObjectData, index: number) => {
            this.mapNodeKeyIndex.set(node.key, index);
        });
    }

    private refreshLinkIndex(linkArray: Array<go.ObjectData>) {
        this.mapLinkKeyIndex.clear();
        linkArray.forEach((link: go.ObjectData, index: number) => {
            this.mapLinkKeyIndex.set(link.key, index);
        });
    }

    render() {
        return (
            <CodeDiagramWrapper
                nodeDateArray={this.state.nodeDataArray}
                linkDataArray={this.state.linkDataArray}
                modelData={this.state.modelData}
                skipsDiagramUpdate={this.state.skipsDiagramUpdate}
            />
        );
    }
}

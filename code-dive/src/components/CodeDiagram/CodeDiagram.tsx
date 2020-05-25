import * as go from 'gojs';
import * as React from 'react';

import { CodeDiagramConfiguration } from './CodeDiagramConfiguration';
import { CodeDiagramWrapper } from './CodeDiagramWrapper'
import { CodeDiagramDataMapper } from './CodeDiagramDataMapper';
import { IType } from '../../codeModel/Types/IType'
import { NodeType } from './NodeType';
import { CodeLocatorType } from './CodeLocatorType';
import { Class } from '../../codeModel/Types/Class';
import { Struct } from '../../codeModel/Types/Struct';
import { Interface } from '../../codeModel/Types/Interface';
import { Enum } from '../../codeModel/Types/Enum';

interface CodeDiagramState {
    nodeDataArray: Array<go.ObjectData>;
    linkDataArray: Array<go.ObjectData>;
    modelData: go.ObjectData;
    skipsDiagramUpdate: boolean;
}

interface CodeDiagramProps {
    configuration: CodeDiagramConfiguration;
    types: IType[];
    onUpdateCode: (typesToUpdate: IType[], path: string) => void;
}

export class CodeDiagram extends React.Component<CodeDiagramProps, CodeDiagramState> {

    constructor(props: CodeDiagramProps) {
        super(props);

        this.state = {
            nodeDataArray: [],
            linkDataArray: [],
            modelData: {},
            skipsDiagramUpdate: true
        };
    }

    static getDerivedStateFromProps(nextProps: CodeDiagramProps, previousState: CodeDiagramState): CodeDiagramState {
        var dataMapper = new CodeDiagramDataMapper(nextProps.types, nextProps.configuration.linkCreationConfiguration);
        var nodeAndLinkData = dataMapper.ComputeNodeAndLinkData();
        
        return {
            ...previousState,
            nodeDataArray: nodeAndLinkData.nodeDataArray,
            linkDataArray: nodeAndLinkData.linkDataArray
        };
    }

    private handleUpdateCode = (nodeData: any, code: string) => {
        if (nodeData.code === code) return;
        try {
            var codeLocator = nodeData.codeLocator;
            var relevantType = this.props.types.filter(type => type.namespace === codeLocator.typeNamespace && type.name === codeLocator.typeName)[0];
            var relevantTypeCopy = this.deepCopyType(relevantType);
            switch(codeLocator.type) {
                case (CodeLocatorType.ConstructorStatement):
                    var relevantConstructor = (relevantTypeCopy as Class | Struct).constructors.filter(callable => callable.index === codeLocator.callableIndex)[0];
                    var relevantStatement = relevantConstructor.statements.filter(statement => statement.index === codeLocator.statementIndex)[0];
                    relevantStatement.statementText = code;
                    break;
                case (CodeLocatorType.MethodStatement):
                    var relevantMethod = (relevantTypeCopy as Class | Struct | Interface).methods.filter(callable => callable.index === codeLocator.callableIndex)[0];
                    var relevantStatement = relevantMethod.statements.filter(statement => statement.index === codeLocator.statementIndex)[0];
                    relevantStatement.statementText = code;
                    break;
            }
            var typesInSameFile = this.props.types.filter(type => type.sourceFilePath === relevantTypeCopy.sourceFilePath 
                && (type.namespace !== relevantTypeCopy.namespace || type.name !== relevantTypeCopy.name))
                .concat([relevantTypeCopy]);
            this.props.onUpdateCode(typesInSameFile, relevantTypeCopy.sourceFilePath);
        }
        catch (e) {
            console.log(`Unexpected error while updating node text: ${e.message}`)
        }
    }
    private deepCopyType(otherType: IType): IType {
        // switch (otherType.constructor) {
        //     case (Class): return new Class(otherType as Class);
        //     case (Struct): return new Struct(otherType as Struct);
        //     case (Interface): return new Interface(otherType as Interface);
        //     default: return new Enum(otherType as Enum);
        // }
        switch(true) {
            case (otherType instanceof Class): return new Class(otherType as Class);
            case (otherType instanceof Struct): return new Struct(otherType as Struct);
            case (otherType instanceof Interface): return new Interface(otherType as Interface);
            default: return new Enum(otherType as Enum);
        }
    }

    render() {
        return (
            <CodeDiagramWrapper
                nodeDataArray={this.state.nodeDataArray}
                linkDataArray={this.state.linkDataArray}
                modelData={this.state.modelData}
                skipsDiagramUpdate={this.state.skipsDiagramUpdate}
                theme={this.props.configuration.theme}
                highlightMaximumDepthRecursion={this.props.configuration.selectionHighlightsConfiguration.recursionDepth}
                highlightChildren={this.props.configuration.selectionHighlightsConfiguration.includeChildren}
                onUpdateNodeText={this.handleUpdateCode}
            />
        );
    }
}

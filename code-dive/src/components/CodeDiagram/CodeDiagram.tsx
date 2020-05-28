import * as go from 'gojs';
import * as React from 'react';

import { CodeDiagramConfiguration } from './CodeDiagramConfiguration';
import { CodeDiagramWrapper } from './CodeDiagramWrapper'
import { CodeDiagramDataMapper } from './CodeDiagramDataMapper';
import { IType } from '../../codeModel/Types/IType'
import { NodeType } from './NodeType';
import { CodeComponentType } from './CodeComponentType';
import { Class } from '../../codeModel/Types/Class';
import { Struct } from '../../codeModel/Types/Struct';
import { Interface } from '../../codeModel/Types/Interface';
import { Enum } from '../../codeModel/Types/Enum';
import { CodeUpdater } from './CodeUpdater';

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
    private codeUpdater: CodeUpdater;

    constructor(props: CodeDiagramProps) {
        super(props);

        this.state = {
            nodeDataArray: [],
            linkDataArray: [],
            modelData: {},
            skipsDiagramUpdate: true
        };

        this.codeUpdater = new CodeUpdater();
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

    private handleUpdateNode = (nodeData: any) => {
        try {
            var codeComponentLocation = nodeData.codeComponentLocation;
            var relevantType = this.props.types.find(type => type.namespace === codeComponentLocation.typeNamespace && type.name === codeComponentLocation.typeName) as IType;
            var relevantTypeCopy = this.deepCopyType(relevantType);
            
            this.codeUpdater.updateCode(relevantTypeCopy, nodeData);
            
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
                onUpdateNode={this.handleUpdateNode}
            />
        );
    }
}

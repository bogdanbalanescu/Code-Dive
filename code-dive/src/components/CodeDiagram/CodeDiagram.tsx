import * as go from 'gojs';
import * as React from 'react';

import { CodeDiagramWrapper } from './CodeDiagramWrapper'
import { CodeDiagramHelper } from './CodeDiagramHelper';
import { IType } from '../../codeModel/Types/IType'

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

        this.state = {
            nodeDataArray: [],
            linkDataArray: [],
            modelData: {},
            skipsDiagramUpdate: true
        };

        this.mapNodeKeyIndex = new Map<go.Key, number>();
        this.mapLinkKeyIndex = new Map<go.Key, number>();
        this.refreshNodeIndex(this.state.nodeDataArray);
        this.refreshLinkIndex(this.state.linkDataArray);
    }

    static getDerivedStateFromProps(nextProps: CodeDiagramProps, previousState: CodeDiagramState): CodeDiagramState {
        var nodeAndLinkData = CodeDiagramHelper.ComputeNodeAndLinkData(nextProps);
        
        return {
            ...previousState,
            nodeDataArray: nodeAndLinkData.nodeDataArray,
            linkDataArray: nodeAndLinkData.linkDataArray
        };
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
                nodeDataArray={this.state.nodeDataArray}
                linkDataArray={this.state.linkDataArray}
                modelData={this.state.modelData}
                skipsDiagramUpdate={this.state.skipsDiagramUpdate}
            />
        );
    }
}

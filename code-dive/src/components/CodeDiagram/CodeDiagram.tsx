import * as go from 'gojs';
import * as React from 'react';

import { CodeDiagramWrapper } from './CodeDiagramWrapper'

interface CodeDiagramState {
    nodeDataArray: Array<go.ObjectData>;
    linkDataArray: Array<go.ObjectData>;
    modelData: go.ObjectData;
    skipsDiagramUpdate: boolean;
}

export class CodeDiagram extends React.Component<{}, CodeDiagramState> {
    private mapNodeKeyIndex: Map<go.Key, number>;
    private mapLinkKeyIndex: Map<go.Key, number>;

    constructor(props: object) {
        super(props);
        this.state = {
            nodeDataArray: [
                { 
                    key: "1", 
                    name: "Class1", 
                    fields: 
                    [
                        {
                        accessModifiers: ["public"],
                        name: "RandomNumber",
                        type: "int"
                        }
                    ]
                },
                { 
                    key: "2", 
                    name: "Class2", fields: 
                    [
                        {
                            accessModifiers: ["protected"],
                            name: "X",
                            type: "int"
                        }
                    ]
                }
            ],
            linkDataArray: [
                { key: "-1", from: "1", to: "2" }
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

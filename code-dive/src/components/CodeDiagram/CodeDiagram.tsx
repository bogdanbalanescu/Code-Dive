import * as go from 'gojs';
import * as React from 'react';

import { CodeDiagramConfiguration } from './CodeDiagramConfiguration';
import { CodeDiagramWrapper } from './CodeDiagramWrapper';
import { CodeDiagramDataMapper } from './CodeDiagramDataMapper';
import { IType } from '../../codeModel/Types/IType'
import { Class } from '../../codeModel/Types/Class';
import { Struct } from '../../codeModel/Types/Struct';
import { Interface } from '../../codeModel/Types/Interface';
import { Enum } from '../../codeModel/Types/Enum';
import { SourceCodeDataMapper } from './SourceCodeDataMapper';
import { NodeType } from './NodeType';
import { ReactOverview } from 'gojs-react';

import '../Overview/Overview.css'

interface CodeDiagramState {
    nodeDataArray: Array<go.ObjectData>;
    linkDataArray: Array<go.ObjectData>;
    modelData: go.ObjectData;
    skipsDiagramUpdate: boolean;
    diagramReference: go.Diagram | undefined;
}

interface CodeDiagramProps {
    configuration: CodeDiagramConfiguration;
    types: IType[];
    onUpdateCode: (typesToUpdate: IType[], path: string) => void;
}

export class CodeDiagram extends React.Component<CodeDiagramProps, CodeDiagramState> {
    private sourceCodeDataMapper: SourceCodeDataMapper;

    constructor(props: CodeDiagramProps) {
        super(props);

        this.state = {
            nodeDataArray: [],
            linkDataArray: [],
            modelData: {},
            skipsDiagramUpdate: true,
            diagramReference: undefined
        };

        this.sourceCodeDataMapper = new SourceCodeDataMapper();
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
            var typesCopy = this.props.types.map(type => this.deepCopyType(type));
            var updatedTypes = this.sourceCodeDataMapper.updateCodeForNode(typesCopy, nodeData);
            
            var existingSourceFiles = this.props.types.map(type => type.sourceFilePath).filter((value, index, self) => self.indexOf(value) === index);
            var updatedTypesGroupedBySourceFilePath = this.groupTypesByProperty(updatedTypes, 'sourceFilePath');

            // update types in existing source files (TODO: remove source files if there are no more types there)
            existingSourceFiles.forEach(sourceFilePath => {
                updatedTypesGroupedBySourceFilePath[sourceFilePath] ?
                    this.updateCodeInSourceFileIfChanged(sourceFilePath, updatedTypesGroupedBySourceFilePath[sourceFilePath]) :
                    this.updateCodeInSourceFileIfChanged(sourceFilePath, []); //this.removeSourceFile(sourceFilePath);
            });
            // update types in new source files
            for (const sourceFilePath in updatedTypesGroupedBySourceFilePath) {
                if (existingSourceFiles.indexOf(sourceFilePath) === -1)
                    this.updateCodeInSourceFileIfChanged(sourceFilePath, updatedTypesGroupedBySourceFilePath[sourceFilePath])
            }
        }
        catch (e) {
            console.log(`Unexpected error while updating node data: ${e.message}`)
        }
    }
    private handleDeletedNodes = (deletedNodesData: any[]) => {
        try {
            var typesCopy = this.props.types.map(type => this.deepCopyType(type));
            var updatedTypes = this.sourceCodeDataMapper.deleteCodeForNodes(typesCopy, deletedNodesData);

            var existingSourceFiles = this.props.types.map(type => type.sourceFilePath).filter((value, index, self) => self.indexOf(value) === index);
            var updatedTypesGroupedBySourceFilePath = this.groupTypesByProperty(updatedTypes, 'sourceFilePath');

            // update types in existing source files (TODO: remove source files if there are no more types there)
            existingSourceFiles.forEach(sourceFilePath => {
                updatedTypesGroupedBySourceFilePath[sourceFilePath] ?
                    this.updateCodeInSourceFileIfChanged(sourceFilePath, updatedTypesGroupedBySourceFilePath[sourceFilePath]) :
                    this.updateCodeInSourceFileIfChanged(sourceFilePath, []); //this.removeSourceFile(sourceFilePath);
            });
            // update types in new source files
            for (const sourceFilePath in updatedTypesGroupedBySourceFilePath) {
                if (existingSourceFiles.indexOf(sourceFilePath) === -1)
                    this.updateCodeInSourceFileIfChanged(sourceFilePath, updatedTypesGroupedBySourceFilePath[sourceFilePath])
            }
        }
        catch(e) {
            console.log(`Unexpected error while deleting nodes: ${e.message}`)
        }
    }
    private updateCodeInSourceFileIfChanged(sourceFilePath: string, types: IType[]) {
        if (types.length === 0 || 
            types.length !== this.props.types.filter(type => type.sourceFilePath === sourceFilePath).length ||
            types.findIndex(type => type.isUpToDate === false) !== -1) {
            this.props.onUpdateCode(types, sourceFilePath);
        }
    }
    private handleAddComponentNode = (nodeData: any, isBefore: boolean) => {
        try {
            var typesCopy = this.props.types.map(type => this.deepCopyType(type));
            var updatedTypes = this.sourceCodeDataMapper.addCodeForNode(typesCopy, nodeData, isBefore);
            var updatedTypesGroupedBySourceFilePath = this.groupTypesByProperty(updatedTypes, 'sourceFilePath');

            for (const sourceFilePath in updatedTypesGroupedBySourceFilePath) {
                this.updateCodeInSourceFileIfChanged(sourceFilePath, updatedTypesGroupedBySourceFilePath[sourceFilePath])
            }
        }
        catch (e) {
            console.log(`Unexpected error while adding node data: ${e.message}`)
        }
    }
    private handleAddTypeNode = (nodeType: NodeType) => {
        try {
            var typesCopy = this.props.types.map(type => this.deepCopyType(type));
            var updatedTypes = this.sourceCodeDataMapper.addTypeForNode(typesCopy, nodeType);

            var existingSourceFiles = this.props.types.map(type => type.sourceFilePath).filter((value, index, self) => self.indexOf(value) === index);
            var updatedTypesGroupedBySourceFilePath = this.groupTypesByProperty(updatedTypes, 'sourceFilePath');

            // update types in existing source files (TODO: remove source files if there are no more types there)
            existingSourceFiles.forEach(sourceFilePath => {
                updatedTypesGroupedBySourceFilePath[sourceFilePath] ?
                    this.updateCodeInSourceFileIfChanged(sourceFilePath, updatedTypesGroupedBySourceFilePath[sourceFilePath]) :
                    this.updateCodeInSourceFileIfChanged(sourceFilePath, []); //this.removeSourceFile(sourceFilePath);
            });
            // update types in new source files
            for (const sourceFilePath in updatedTypesGroupedBySourceFilePath) {
                if (existingSourceFiles.indexOf(sourceFilePath) === -1)
                    this.updateCodeInSourceFileIfChanged(sourceFilePath, updatedTypesGroupedBySourceFilePath[sourceFilePath])
            }
        }
        catch(e) {
            console.log(`Unexpected error while deleting nodes: ${e.message}`)
        }
    }

    // helper functions for finding types and members
    private deepCopyType(otherType: IType): IType {
        switch(true) {
            case (otherType instanceof Class): return new Class(otherType as Class);
            case (otherType instanceof Struct): return new Struct(otherType as Struct);
            case (otherType instanceof Interface): return new Interface(otherType as Interface);
            default: return new Enum(otherType as Enum);
        }
    }
    private groupTypesByProperty (types: IType[], key: any): any {
        return types.reduce(function (rv: any, x: any) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };

    // diagram loaded handler
    private handleDiagramLoaded = (diagramReference: go.Diagram) => {
        this.setState({
            ...this.state, diagramReference: diagramReference
        });
    }

    render() {
        return (
            <div>
                <CodeDiagramWrapper
                    nodeDataArray={this.state.nodeDataArray}
                    linkDataArray={this.state.linkDataArray}
                    modelData={this.state.modelData}
                    skipsDiagramUpdate={this.state.skipsDiagramUpdate}
                    theme={this.props.configuration.theme}
                    highlightMaximumDepthRecursion={this.props.configuration.selectionHighlightsConfiguration.recursionDepth}
                    highlightChildren={this.props.configuration.selectionHighlightsConfiguration.includeChildren}
                    onDiagramLoaded={this.handleDiagramLoaded}
                    onUpdateNode={this.handleUpdateNode}
                    onDeletedNodes={this.handleDeletedNodes}
                    onAddComponentNode={this.handleAddComponentNode}
                    onAddTypeNode={this.handleAddTypeNode}
                />
                {
                    this.props.configuration.showOverview && this.state.diagramReference ?
                    (
                        <ReactOverview
                            initOverview={() => new go.Overview()}
                            divClassName={this.props.configuration.theme === 'Dark'? 'dark-overview': 'light-overview'}
                            observedDiagram={this.state.diagramReference}
                        />
                    ): null
                }
            </div>
        );
    }
}

import * as go from 'gojs';
import * as React from 'react';
import { ReactDiagram } from 'gojs-react';

import './CodeDiagramWrapper.css';
import { LinkType } from './LinkType';
import { NodeType } from './NodeType';
import { StatementAtomSemantic } from './StatementAtomSemantic';
import { Inspector } from '../DataInspector/DataInspector';

interface CodeDiagramProps {
    nodeDataArray: Array<go.ObjectData>;
    linkDataArray: Array<go.ObjectData>;
    modelData: go.ObjectData;
    skipsDiagramUpdate: boolean;
    theme: string;
    highlightMaximumDepthRecursion: number;
    highlightChildren: boolean;
    onUpdateNodeText: (nodeData: any, text: string) => void;
}

class DarkThemeColors {
    // Node Containers
    NodeStroke: string = "#555555"; // Gray #333
    NodeBackground: string = "#333333"; // Gray #555
    // Highlighted Stroke
    HighlightedStroke: string = "pink"; // TODO: settle on a comfortable color
    
    // Node and Link Components
    Type: string = "#3663A5"; // Lapis Iazuli
    Field: string = "#4F8D60"; // Middle green
    Callable: string = "#E2D171"; // Arylide yellow
    Default: string = "#57A3C1"; // Maximum blue

    // Inheritance Link
    Inheritance: string = "white";

    // Subgraph Expander Button
    SubgraphExpanderButtonFillNormal: string = "#db9d47"; // Indian yellow
    SubgraphExpanderButtonStrokeNormal: string = "black";
    SubgraphExpanderButtonFillOver: string = "lightgreen";
    SubgraphExpanderButtonStrokeOver: string = "green";
}
class LightThemeColors {
    // Node Containers
    NodeStroke: string = "black";
    NodeBackground: string = "white";
    // Highlighted Stroke
    HighlightedStroke: string = "magenta";
    
    // Node and Link Components
    Type: string = "blue";
    Field: string = "green";
    Callable: string = "darkorange";
    Default: string = "black";

    // Inheritance Link
    Inheritance: string = "black";

    // Subgraph Expander Button
    SubgraphExpanderButtonFillNormal: string = "white";
    SubgraphExpanderButtonStrokeNormal: string = "black";
    SubgraphExpanderButtonFillOver: string = "lightgreen";
    SubgraphExpanderButtonStrokeOver: string = "green";
}
type Theme = DarkThemeColors | LightThemeColors;

export class CodeDiagramWrapper extends React.Component<CodeDiagramProps, {}> {
    private diagramReference: React.RefObject<ReactDiagram>;
    private inspectorReference: React.RefObject<HTMLDivElement>;
    private $: any;
    private theme: Theme;

    constructor(props: CodeDiagramProps) {
        super(props);
        this.diagramReference = React.createRef();
        this.inspectorReference = React.createRef<HTMLDivElement>();
        this.$ = go.GraphObject.make;
        this.theme = this.props.theme === 'Dark' ? new DarkThemeColors(): new LightThemeColors();
    }

    componentDidUpdate = (prevProps: CodeDiagramProps, prevState: any, prevContext: any) => {
        if (this.props.nodeDataArray !== prevProps.nodeDataArray && this.diagramReference.current != null) {
            let diagram = this.diagramReference.current.getDiagram();
            if (diagram != null) {
                diagram.startTransaction();
                // Nodes
                prevProps.nodeDataArray.forEach(previousNode => {
                    if (diagram == null) return;
                    var nodeIndex = this.props.nodeDataArray.findIndex(currentNode => currentNode.key === previousNode.key);
                    if (nodeIndex === -1) { // node does not exist any more
                        var node = diagram.findPartForKey(previousNode.key);
                        if (node !== null) diagram.remove(node);
                    }
                    else { // node exists
                        var currentNode = this.props.nodeDataArray[nodeIndex];
                        if (!this.jsonEqual(previousNode, currentNode)) { // node data has changed
                            var node = diagram.findPartForKey(previousNode.key);
                            if (node !== null) diagram.model.assignAllDataProperties(node.data, currentNode);
                        }
                    }
                })
                this.props.nodeDataArray.forEach(currentNode => {
                    if (diagram == null) return;
                    if (prevProps.nodeDataArray.findIndex(previousNode => previousNode.key === currentNode.key) === -1) { // node is new
                        diagram.model.addNodeData(currentNode);
                    }
                })
                // Links
                prevProps.linkDataArray.forEach(previousLink => {
                    if (diagram == null) return;
                    if (this.props.linkDataArray.findIndex(currentLink => this.jsonEqual(previousLink, currentLink)) === -1) { // if link no longer exists or was modified, delete it
                        var link = diagram.findLinkForKey(previousLink.key);
                        if (link !== null) diagram.remove(link);
                    }
                });
                this.props.linkDataArray.forEach(currentLink => {
                    if (diagram == null) return;
                    if (prevProps.linkDataArray.findIndex(previousLink => this.jsonEqual(previousLink, currentLink)) === -1) {
                        (diagram.model as go.GraphLinksModel).addLinkData(currentLink);
                    }
                });
                diagram.commitTransaction();
            }
        }
    }

    componentDidMount = () => {
        // Add listeners to the diagram.
        if (this.diagramReference.current !== null) {
            let diagram = this.diagramReference.current.getDiagram();
            if (diagram !== null) {
                diagram.addDiagramListener('TextEdited', this.updateNodeText);
            }
        }
        // Create the diagram inspector
        if (this.diagramReference.current !== null) {
            let diagram = this.diagramReference.current.getDiagram();
            if (diagram !== null) {
                var inspector = new Inspector(this.inspectorReference.current as HTMLDivElement, diagram, {
                    includesOwnProperties: false,
                    // TODO: add the properties which are to be shown for each node or group
                    properties: {
                        "code": { show: Inspector.showIfPresent }
                    },
                    // TODO: subscribe to property modified event handler (also consider disabling the automatic update of data on the diagram)
                    propertyModified: (a: string, b: string, c: Inspector) => {
                        console.log(`Changed property: ${a}, New value: ${b}, Object data: `, c.inspectedObject? c.inspectedObject.data : {});
                    }
                });
            }
        }
    }
    componentWillUnmount = () => {
        // Remove listeners from the diagram.
        if (this.diagramReference.current !== null) {
            let diagram = this.diagramReference.current.getDiagram();
            if (diagram !== null) {
                diagram.removeDiagramListener('TextEdited', this.updateNodeText);
            }
        }
    }
    private updateNodeText = (e: go.DiagramEvent) => {
        try {
            var code = (e.subject as go.TextBlock).text;
            var textBlockTemplateBinder = (e.subject as go.GraphObject).findTemplateBinder();
            if (textBlockTemplateBinder) {
                var textBlockParent = textBlockTemplateBinder.findMainElement();
                if (textBlockParent) {
                    var textBlockParentTemplateBinder = textBlockParent.findTemplateBinder();
                    if (textBlockParentTemplateBinder) {
                        var data = textBlockParentTemplateBinder.data;
                        (e.subject as go.TextBlock).text = data.code;
                        this.props.onUpdateNodeText(data as go.ObjectData, code as string);
                    }
                }
            }
        }
        catch (e) {
            console.log(`Unexpected message on editing a node's or group's text: ${e.message}`);
        }
    }

    private initDiagram = (): go.Diagram => {
        // diagram
        const diagram: go.Diagram = 
            this.$(go.Diagram, 
                {
                    model: this.$(go.GraphLinksModel, 
                    {
                        nodeKeyProperty: "key",
                        linkKeyProperty: "key",
                        linkFromPortIdProperty: "fromPort",
                        linkToPortIdProperty: "toPort",
                        nodeCategoryProperty: "category",
                        linkCategoryProperty: "category"
                    }),
                    layout: this.$(go.LayeredDigraphLayout, 
                    {
                        direction: 0,
                        layerSpacing: 25,
                        columnSpacing: 25,
                        cycleRemoveOption: go.LayeredDigraphLayout.CycleGreedy,
                        layeringOption: go.LayeredDigraphLayout.LayerLongestPathSink,
                        initializeOption: go.LayeredDigraphLayout.InitDepthFirstOut,
                        aggressiveOption: go.LayeredDigraphLayout.AggressiveMore,
                        packOption: go.LayeredDigraphLayout.PackExpand,
                        setsPortSpots: false
                    }),
                    click: this.onSelectionClick
                });

        // enum value node and group templates
        diagram.nodeTemplateMap.add(NodeType.EnumValue, this.enumValueNodeTemplate());
        diagram.groupTemplateMap.add(NodeType.EnumValuesContainer, this.enumValuesContainerGroupTemplate());
        // field node and group templates
        diagram.nodeTemplateMap.add(NodeType.Field, this.fieldNodeTemplate());
        diagram.groupTemplateMap.add(NodeType.FieldsContainer, this.fieldsContainerGroupTemplate());
        // parameter node template
        diagram.nodeTemplateMap.add(NodeType.Parameter, this.parameterNodeTemplate());
        // statement node template
        diagram.nodeTemplateMap.add(NodeType.Statement, this.statementNodeTemplate());
        // property accessor group templates
        diagram.groupTemplateMap.add(NodeType.PropertyAccessor, this.propertyAccessorGroupTemplate());
        // property node and group templates
        diagram.groupTemplateMap.add(NodeType.PropertyHeader, this.propertyHeaderGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.PropertyBody, this.methodPartContainerGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.PropertyHeaderContainer, this.methodPartContainerGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.PropertyBodyContainer, this.methodPartContainerGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.Property, this.methodGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.PropertiesContainer, this.methodsContainerGroupTemplate("Properties"));
        // constructor group templates
        diagram.groupTemplateMap.add(NodeType.ConstructorHeader, this.methodHeaderGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.ConstructorBody, this.methodBodyGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.ConstructorHeaderContainer, this.methodPartContainerGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.ConstructorBodyContainer, this.methodPartContainerGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.Constructor, this.methodGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.ConstructorsContainer, this.methodsContainerGroupTemplate("Constructors"));
        // method group templates
        diagram.groupTemplateMap.add(NodeType.MethodHeader, this.methodHeaderGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.MethodBody, this.methodBodyGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.MethodHeaderContainer, this.methodPartContainerGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.MethodBodyContainer, this.methodPartContainerGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.Method, this.methodGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.MethodsContainer, this.methodsContainerGroupTemplate("Methods"));
        // type group templates
        diagram.groupTemplateMap.add(NodeType.Class, this.classGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.Struct, this.classGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.Interface, this.classGroupTemplate());
        diagram.groupTemplateMap.add(NodeType.Enum, this.enumGroupTemplate());

        // inheritance links
        diagram.linkTemplateMap.add(LinkType.Realization, this.inheritanceLink());
        diagram.linkTemplateMap.add(LinkType.Generalization, this.inheritanceLink());
        // links to types
        diagram.linkTemplateMap.add(LinkType.MemberType, this.linksToTypes());
        diagram.linkTemplateMap.add(LinkType.ParameterType, this.linksToTypes());
        diagram.linkTemplateMap.add(LinkType.StatementUsesType, this.linksToTypes());
        // links to members
        diagram.linkTemplateMap.add(LinkType.StatementUsesEnumValue, this.linksToUsedMembers());
        diagram.linkTemplateMap.add(LinkType.StatementUsesFieldOrProperty, this.linksToUsedMembers());
        diagram.linkTemplateMap.add(LinkType.StatementUsesConstructorOrMethod, this.linksToUsedMembers());

        return diagram;
    }

    // enum value templates
    private enumValueNodeTemplate = () => {
        return this.$(go.Node, "Horizontal",
            { movable: false, click: this.onSelectionClick },
            this.$(go.TextBlock,
                { isMultiline: false, editable: false },
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.Default)).ofObject(),
                new go.Binding("text", "value"))
        );
    }
    private enumValuesContainerGroupTemplate = () => {
        return this.$(go.Group, "Table", { name: "Container" },
            { movable: false, click: this.onSelectionClick },
            this.$(go.Shape, "RoundedRectangle", 
                { stretch: go.GraphObject.Fill, strokeWidth: 2, columnSpan: 2, fill: this.theme.NodeBackground },
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.NodeStroke)).ofObject()),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 2) }),
            this.$(go.TextBlock, "Values",
                { font: "italic bold 10pt sans-serif", stroke: this.theme.Default, margin: 5 },
                new go.Binding("visible", "isSubGraphExpanded", (isSubGraphExpanded   => { return !isSubGraphExpanded} )).ofObject("Container")),
            this.$(go.Placeholder, { column: 0, margin: 5 }),
            this.$("SubGraphExpanderButton",
                { 
                    column: 1, margin: 5, alignment: go.Spot.TopRight, visible: true,
                    "_buttonFillNormal": this.theme.SubgraphExpanderButtonFillNormal,
                    "ButtonBorder.fill": this.theme.SubgraphExpanderButtonFillNormal,
                    "_buttonStrokeNormal": this.theme.SubgraphExpanderButtonStrokeNormal,
                    "_buttonFillOver": this.theme.SubgraphExpanderButtonFillOver,
                    "_buttonStrokeOver": this.theme.SubgraphExpanderButtonStrokeOver,
                }),
        );
    }
    // access modifier template
    private accessModifierTemplate = () => {
        return this.$(go.Panel, "Horizontal",
            { margin: new go.Margin(0, 4, 0, 0) },
            this.$(go.TextBlock,
                {
                    name: "SYMBOL", visible: true, textAlign: "center", stroke: this.theme.Type, cursor: "pointer",
                    click: (e: any, node: any) => node.visible = false
                },
                new go.Binding("text", "", this.accessModifierToSymbol),
                new go.Binding("visible", "visible", (visible => !visible)).ofObject("ACCESSMODIFIER")),
            this.$(go.TextBlock,
                {
                    name: "ACCESSMODIFIER", visible: false, textAlign: "center", stroke: this.theme.Type, cursor: "pointer",
                    click: (e: any, node: any) => node.visible = false
                },
                new go.Binding("text", ""),
                new go.Binding("visible", "visible", (visible => !visible)).ofObject("SYMBOL")),
        );
    }
    // field templates
    private fieldNodeTemplate = () => {
        return this.$(go.Node, "Auto",
            { movable: false, click: this.onSelectionClick },
            this.$(go.Shape, "RoundedRectangle", 
                { fill: this.theme.NodeBackground },
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.NodeStroke)).ofObject()),
            this.$(go.Panel, "Horizontal",
                // field visibility access modifiers
                this.$(go.Panel, "Horizontal",
                    { stretch: go.GraphObject.Fill, defaultAlignment: go.Spot.Left, itemTemplate: this.accessModifierTemplate() },
                    new go.Binding("itemArray", "modifiers", this.filterViewableModifiers)),
                // field name
                this.$(go.TextBlock,
                    { margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: this.theme.Field },
                    new go.Binding("text", "name"),
                    new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
                // :
                this.$(go.TextBlock, ":", { stroke: this.theme.Default }),
                // field type
                this.$(go.TextBlock, { stroke: this.theme.Type },
                    new go.Binding("text", "type"),
                    new go.Binding("margin", "statementAtoms", statementAtoms => statementAtoms.length > 0 ? new go.Margin(0, 3, 0, 0): 0)),
                // parameter default value
                this.$(go.Panel, "Horizontal",
                    { 
                        stretch: go.GraphObject.Fill, defaultAlignment: go.Spot.Left,
                        itemTemplate: this.statementAtomTemplate()
                    },
                    new go.Binding("itemArray", "statementAtoms"))),
        );
    }
    private fieldsContainerGroupTemplate = () => {
        return this.$(go.Group, "Table", { name: "Container" },
            { movable: false, click: this.onSelectionClick },
            this.$(go.Shape, "RoundedRectangle", 
                { stretch: go.GraphObject.Fill, strokeWidth: 2, columnSpan: 2, fill: this.theme.NodeBackground },
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.NodeStroke)).ofObject()),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 2) }),
            this.$(go.TextBlock, "Fields",
                { font: "italic bold 10pt sans-serif", stroke: this.theme.Field, margin: 5 },
                new go.Binding("visible", "isSubGraphExpanded", (isSubGraphExpanded   => { return !isSubGraphExpanded} )).ofObject("Container")),
            this.$(go.Placeholder, { column: 0, margin: 5, alignment: go.Spot.Left }),
            this.$("SubGraphExpanderButton",
                { 
                    column: 1, margin: 5, alignment: go.Spot.TopRight, visible: true,
                    "_buttonFillNormal": this.theme.SubgraphExpanderButtonFillNormal,
                    "ButtonBorder.fill": this.theme.SubgraphExpanderButtonFillNormal,
                    "_buttonStrokeNormal": this.theme.SubgraphExpanderButtonStrokeNormal,
                    "_buttonFillOver": this.theme.SubgraphExpanderButtonFillOver,
                    "_buttonStrokeOver": this.theme.SubgraphExpanderButtonStrokeOver,
                }),
        );
    };
    // statement template
    private statementAtomTemplate = () => {
        return this.$(go.Panel, "Auto",
            this.$(go.TextBlock,
                { isMultiline: false, stretch: go.GraphObject.Fill, margin: new go.Margin(0, 3, 0, 0) },
                new go.Binding("text", "text"),
                new go.Binding("stroke", "semantic", semantic => this.mapStatementAtomSemanticToStroke(semantic))),
        );
    }
    private statementNodeTemplate = () => {
        return this.$(go.Node, "Horizontal",
            { movable: false, click: this.onSelectionClick },
            this.$(go.Panel, 
                new go.Binding("width", "blockCount", blockCount => blockCount * 15)), //TODO: parameterize the value by which the width is computed
            this.$(go.Panel, "Horizontal",
                { 
                    stretch: go.GraphObject.Fill, defaultAlignment: go.Spot.Left,
                    itemTemplate: this.statementAtomTemplate()
                },
                new go.Binding("itemArray", "statementAtoms"),
                new go.Binding("visible", "isSelected", isSelected => !isSelected).ofObject()),
            this.$(go.TextBlock, { editable: true, stroke: this.theme.Default },
                new go.Binding("text", "code"),
                new go.Binding("visible", "isSelected", isSelected => isSelected).ofObject()),
        );
    }
    // parameter template
    private parameterNodeTemplate = () => {
        return this.$(go.Node, "Horizontal",
            { movable: false, click: this.onSelectionClick },
            // parameter name
            this.$(go.TextBlock,
                { isMultiline: false, editable: false, stroke: this.theme.Field },
                new go.Binding("text", "name")),
            // :
            this.$(go.TextBlock, ":", { stroke: this.theme.Default }),
            // parameter type
            this.$(go.TextBlock,
                { isMultiline: false, editable: false, stroke: this.theme.Type },
                new go.Binding("text", "type"),
                new go.Binding("margin", "statementAtoms", statementAtoms => statementAtoms.length > 0 ? new go.Margin(0, 3, 0, 0): 0)),
            // parameter default value
            this.$(go.Panel, "Horizontal",
                { 
                    stretch: go.GraphObject.Fill, defaultAlignment: go.Spot.Left,
                    itemTemplate: this.statementAtomTemplate()
                },
                new go.Binding("itemArray", "statementAtoms")),
            // ,
            this.$(go.TextBlock, ", ",
                { isMultiline: false, editable: false, stroke: this.theme.Default },
                new go.Binding("text", ", "),
                new go.Binding("visible", "isLast", isLast => { return isLast !== true })),
        );
    }
    // property accessor templates
    private propertyAccessorGroupTemplate = () => {
        return this.$(go.Group, "Table",
            { movable: false, click: this.onSelectionClick },
            this.$(go.Shape, "RoundedRectangle", 
                { stretch: go.GraphObject.Fill, rowSpan: 2, fill: this.theme.NodeBackground },
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.NodeStroke)).ofObject()),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 1) }),
            // method name
            this.$(go.TextBlock,
                { row: 0, margin: new go.Margin(2, 2, 0, 2), isMultiline: false, editable: false, stroke: this.theme.Field, alignment: go.Spot.Left },
                new go.Binding("text", "name"),
                new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
            this.$(go.Placeholder, { row: 1, margin: new go.Margin(2, 2, 2, 4) }),
            );
    }
    // property templates
    private propertyHeaderGroupTemplate = () => {
        return this.$(go.Group, "Table",
            { movable: false, stretch: go.GraphObject.Fill, click: this.onSelectionClick },
            // method visibility access modifiers
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 1) }), // TODO: revise wrapping column number
            this.$(go.Panel, "Horizontal",
                new go.Binding("itemArray", "modifiers", this.filterViewableModifiers),
                {
                    row: 0, column: 0, stretch: go.GraphObject.Fill,
                    defaultAlignment: go.Spot.Left,
                    itemTemplate: this.accessModifierTemplate()
                }),
            // method name
            this.$(go.TextBlock,
                { row: 0, column: 1, margin: new go.Margin(0, 2, 0, 0), isMultiline: false, editable: false, stroke: this.theme.Callable, alignment: go.Spot.Left },
                new go.Binding("text", "name"),
                new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
            // (
            this.$(go.TextBlock, "(", { row: 0, column: 2, width: 5, stroke: this.theme.Default }),
            // parameters placeholder
            this.$(go.Placeholder, { row: 0, column: 3 }),
            // )
            this.$(go.TextBlock, ")", { row: 0, column: 4, width: 5, stroke: this.theme.Default }),
            // :
            this.$(go.TextBlock, ":", 
                { row:0, column: 5, stroke: this.theme.Default },
                new go.Binding("visible", "", method => method.type !== undefined)),
            // method type
            this.$(go.TextBlock,
                { row: 0, column: 6, isMultiline: false, editable: false, stroke: this.theme.Type, alignment: go.Spot.Left },
                new go.Binding("text", "type"),
                new go.Binding("margin", "statementAtoms", statementAtoms => statementAtoms.length > 0 ? new go.Margin(0, 3, 0, 0): 0)),
            // parameter default value
            this.$(go.Panel, "Horizontal",
                {
                    row: 0, column: 7, stretch: go.GraphObject.Fill, defaultAlignment: go.Spot.Left,
                    itemTemplate: this.statementAtomTemplate()
                },
                new go.Binding("itemArray", "statementAtoms")),
            );
    }
    // type method templates (also used for some parts of constructors and properties)
    private methodHeaderGroupTemplate = () => {
        return this.$(go.Group, "Table",
            { movable: false, stretch: go.GraphObject.Fill, click: this.onSelectionClick,
                doubleClick: (e: any, node: go.Node) => {
                    console.log('double clicked', e, node);
                    var sa = node.findObject("placeholder");
                    if (sa !== null) sa.visible = false;
                } },
            // method visibility access modifiers
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 1) }), // TODO: revise wrapping column number
            this.$(go.Panel, "Horizontal",
                new go.Binding("itemArray", "modifiers", this.filterViewableModifiers),
                {
                    row: 0, column: 0, stretch: go.GraphObject.Fill,
                    defaultAlignment: go.Spot.Left,
                    itemTemplate: this.accessModifierTemplate()
                }),
            // method name
            this.$(go.TextBlock,
                { row: 0, column: 1, margin: new go.Margin(0, 2, 0, 0), isMultiline: false, editable: false, stroke: this.theme.Callable, alignment: go.Spot.Left },
                new go.Binding("text", "name"),
                new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
            // (
            this.$(go.TextBlock, "(", { row: 0, column: 2, width: 5, stroke: this.theme.Default }),
            // parameters placeholder
            this.$(go.Placeholder, { row: 0, column: 3 }, { name: "placeholder" }),
            // )
            this.$(go.TextBlock, ")", { row: 0, column: 4, width: 5, stroke: this.theme.Default }),
            // :
            this.$(go.TextBlock, ":", 
                { row:0, column: 5, stroke: this.theme.Default },
                new go.Binding("visible", "", method => method.type !== undefined)),
            // method type
            this.$(go.TextBlock,
                { row: 0, column: 6, isMultiline: false, editable: false, stroke: this.theme.Type, alignment: go.Spot.Left },
                new go.Binding("text", "type")),
            );
    }
    private methodBodyGroupTemplate = () => {
        return this.$(go.Group, "Table",
            { movable: false, click: this.onSelectionClick },
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 1) }),
            // // drawn before row 1:
            // this.$(go.Panel, { row: 0, width: go.GraphObject.Fill, height: 0 }),
            // this.$(go.RowColumnDefinition,
            //     { row: 1, separatorStrokeWidth: 1.5, separatorStroke: "black" }),
            this.$(go.Placeholder, { row: 1 })
            );
    }
    private methodPartContainerGroupTemplate = () => {
        return this.$(go.Group, "Table",
            { movable: false, click: this.onSelectionClick },
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 1) }),
            this.$(go.Placeholder)
            );
    }
    private methodGroupTemplate = () => {
        return this.$(go.Group, "Auto",
            { movable: false, click: this.onSelectionClick },
            this.$(go.Shape, "RoundedRectangle", 
                { fill: this.theme.NodeBackground },
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.NodeStroke)).ofObject()),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 1) }),
            this.$(go.Placeholder),
            );
    }
    private methodsContainerGroupTemplate = (groupName: string) => {
        return this.$(go.Group, "Table", { name: "Container" },
            { movable: false, click: this.onSelectionClick },
            this.$(go.Shape, "RoundedRectangle", 
                { stretch: go.GraphObject.Fill, strokeWidth: 2, columnSpan: 2, fill: this.theme.NodeBackground },
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.NodeStroke)).ofObject()),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 2) }),
            this.$(go.TextBlock, groupName,
                { font: "italic bold 10pt sans-serif", stroke: this.theme.Callable, margin: 5 },
                new go.Binding("visible", "isSubGraphExpanded", (isSubGraphExpanded   => { return !isSubGraphExpanded} )).ofObject("Container")),
            this.$(go.Placeholder, { column: 0, margin: 5, alignment: go.Spot.Left }),
            this.$("SubGraphExpanderButton",
                {
                    column: 1, margin: 5, alignment: go.Spot.TopRight, visible: true,
                    "_buttonFillNormal": this.theme.SubgraphExpanderButtonFillNormal,
                    "ButtonBorder.fill": this.theme.SubgraphExpanderButtonFillNormal,
                    "_buttonStrokeNormal": this.theme.SubgraphExpanderButtonStrokeNormal,
                    "_buttonFillOver": this.theme.SubgraphExpanderButtonFillOver,
                    "_buttonStrokeOver": this.theme.SubgraphExpanderButtonStrokeOver,
                }),
        );
    }

    // type templates (classes, structs, interfaces, enums)
    private classGroupTemplate = () => {
        return this.$(go.Group, "Auto",
            { locationSpot: go.Spot.Center, click: this.onSelectionClick },
            this.$(go.Shape, "RoundedRectangle", 
                { stretch: go.GraphObject.Fill, strokeWidth: 2, rowSpan: 2, fill: this.theme.NodeBackground },
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.NodeStroke)).ofObject()),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 2) }),
            this.$(go.Panel, "Table",
                { defaultRowSeparatorStroke: this.theme.NodeStroke },
                // class name
                this.$(go.TextBlock,
                    {
                        row: 0, margin: 3, alignment: go.Spot.Center,
                        font: "bold 12pt sans-serif",
                        isMultiline: false, editable: false,
                        stroke: this.theme.Type
                    },
                    new go.Binding("text", "name")),
                // member groups
                this.$(go.Placeholder,
                    { row: 1, margin: 3, stretch: go.GraphObject.Fill })
            )
        );
    }
    private enumGroupTemplate = () => {
        return this.$(go.Group, "Auto",
            { locationSpot: go.Spot.Center, click: this.onSelectionClick },
            this.$(go.Shape, "RoundedRectangle", 
                { strokeWidth: 2, fill: this.theme.NodeBackground },
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.NodeStroke)).ofObject()),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 2) }),
            this.$(go.Panel, "Table",
                { defaultRowSeparatorStroke: this.theme.NodeStroke },
                // enum name
                this.$(go.TextBlock,
                    {
                        row: 0, margin: 3, alignment: go.Spot.Center,
                        isMultiline: false, editable: false,
                        font: "bold 12pt sans-serif",
                        stroke: this.theme.Type
                    },
                    new go.Binding("text", "name")),
                // enum values
                this.$(go.Placeholder,
                    { row: 1, margin: 3, stretch: go.GraphObject.Fill })
            )
        );
    }

    // link templates
    private inheritanceLink = () => {
        return this.$(go.Link,
            { 
                routing: go.Link.AvoidsNodes, // link route should avoid nodes
                corner: 10,
                curve: go.Link.JumpGap, // rounded corners
                fromEndSegmentLength: 15,
                toEndSegmentLength: 15,
                reshapable: false,
                fromSpot: go.Spot.TopSide,
                toSpot: go.Spot.BottomSide,
                click: this.onSelectionClick
            },
            this.$(go.Shape, 
                new go.Binding("strokeDashArray", "category", category => category === LinkType.Realization? [4, 2]: []),
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.Inheritance)).ofObject()),
            this.$(go.Shape, 
                { toArrow: "Triangle", fill: "white" },
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.Inheritance)).ofObject())
        );
    }
    private linksToTypes = () => {
        return this.$(go.Link,
            { 
                routing: go.Link.AvoidsNodes, // link route should avoid nodes
                corner: 10,
                curve: go.Link.JumpGap, // rounded corners
                fromEndSegmentLength: 15,
                toEndSegmentLength: 15,
                reshapable: false,
                fromSpot: go.Spot.RightSide,
                toSpot: go.Spot.LeftSide,
                click: this.onSelectionClick
            },
            this.$(go.Shape, 
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.Type)).ofObject()),
            this.$(go.Shape, 
                { toArrow: "Standard", fill: this.theme.Type },
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.Type)).ofObject()),
        );
    }
    private linksToUsedMembers = () => {
        return this.$(go.Link,
            { 
                routing: go.Link.AvoidsNodes, // link route should avoid nodes
                corner: 10,
                curve: go.Link.JumpGap, // rounded corners
                fromEndSegmentLength: 15,
                toEndSegmentLength: 15,
                reshapable: false,
                fromSpot: go.Spot.RightSide,
                toSpot: go.Spot.LeftSide,
                click: this.onSelectionClick
            },
            this.$(go.Shape, 
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.Callable)).ofObject()),
            this.$(go.Shape, 
                { toArrow: "Standard", fill: this.theme.Callable },
                new go.Binding("stroke", "isHighlighted", isHighlighted => this.strokeOrHighlight(isHighlighted, this.theme.Callable)).ofObject()),
        );
    }

    // part events
    private onSelectionClick = (e: any, part: any) => { // highlight all Links and Nodes connected with a given Group, Node or Link
        if (this.diagramReference.current !== null) {
            let diagram = this.diagramReference.current.getDiagram();
            if (diagram !== null) {
                diagram.startTransaction("highlight");
                diagram.clearHighlighteds();
                diagram.selection.each(part => this.highlightPart(part));
                diagram.commitTransaction("highlight");
            }
        }
    }
    private highlightPart = (part: go.Part, currentHighlightDepth: number = 0) => { // highlight all Links and Nodes connected with a given Part
        if (part !== undefined && (part.isHighlighted === false || currentHighlightDepth === 0)) {
            part.isHighlighted = true;
            if (part instanceof go.Group && currentHighlightDepth < this.props.highlightMaximumDepthRecursion) {
                if (this.props.highlightChildren) {
                    part.memberParts.each(memberPart => this.highlightPart(memberPart, currentHighlightDepth + 1));
                }
                part.findLinksOutOf().each(link => this.highlightPart(link, currentHighlightDepth + 1));
                part.findNodesOutOf().each(node => this.highlightPart(node, currentHighlightDepth + 1));
            }
            else if (part instanceof go.Node && currentHighlightDepth < this.props.highlightMaximumDepthRecursion) {
                part.findLinksOutOf().each(link => this.highlightPart(link, currentHighlightDepth + 1));
                part.findNodesOutOf().each(node => this.highlightPart(node, currentHighlightDepth + 1));
            }
            else if (part instanceof go.Link && currentHighlightDepth < this.props.highlightMaximumDepthRecursion) {
                if (part.toNode !== null) this.highlightPart(part.toNode, currentHighlightDepth + 1)
                if (part.fromNode !== null) part.fromNode.isHighlighted = true;
            }
        }
    }

    // conversion functions
    private accessModifierToSymbol = (accessModifier: string) => {
        switch (accessModifier) {
            case "public": return "+";
            case "private": return "-";
            case "protected": return "#";
            case "internal": return "~";
            default: return "";
        }; 
    }
    private symbolToAccessModifier = (symbol: string) => {
        switch(symbol) {
            case "+": return "public";
            case "-": return "private";
            case "#": return "protected";
            case "~": return "internal";
            default: return "";
        };
    }
    private filterViewableModifiers = (modifiers: string[]) => {
        return modifiers.filter((modifier: string) => {
            return ["public", "private", "protected", "internal"].includes(modifier);
        })
    }
    private mapStatementAtomSemanticToStroke = (semantic: string): string => {
        switch (semantic) {
            case StatementAtomSemantic.FieldOrProperty: return this.theme.Field;
            case StatementAtomSemantic.Constructor: return this.theme.Callable;
            case StatementAtomSemantic.Method: return this.theme.Callable;
            case StatementAtomSemantic.Type: return this.theme.Type;
            default: return this.theme.Default;
        }
    }
    private strokeOrHighlight = (isHighlighted: any, stroke: string): string => isHighlighted? this.theme.HighlightedStroke: stroke;

    // helper functions
    private jsonEqual = (a: any, b: any) => this.jsonStringifyWithoutGoHashId(a) === this.jsonStringifyWithoutGoHashId(b);
    private jsonStringifyWithoutGoHashId = (a: any) => JSON.stringify(a, (key, value) => {
        if (key === "__gohashid") return undefined;
        return value;
    });

    render() {
        return (
            <div>
                <div>
                    <ReactDiagram
                        ref={this.diagramReference}
                        divClassName={this.props.theme === 'Dark'? 'code-diagram-component-dark-theme': 'code-diagram-component-light-theme'}
                        initDiagram={this.initDiagram}
                        nodeDataArray={this.props.nodeDataArray}
                        linkDataArray={this.props.linkDataArray}
                        modelData={this.props.modelData}
                        onModelChange={() => {console.log('for now, we do nothing when model changes')}}
                        skipsDiagramUpdate={this.props.skipsDiagramUpdate}
                    />
                </div>
                <div ref={this.inspectorReference}></div>
            </div>
        )
    }
}

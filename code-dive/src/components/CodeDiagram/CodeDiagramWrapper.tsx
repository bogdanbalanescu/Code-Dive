import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';

import './CodeDiagramWrapper.css';
import { LinkType } from './LinkType';
import { NodeType } from './NodeType';
import { StatementAtomSemantic } from './StatementAtomSemantic';

interface CodeDiagramProps { 
    nodeDataArray: Array<go.ObjectData>;
    linkDataArray: Array<go.ObjectData>;
    modelData: go.ObjectData;
    skipsDiagramUpdate: boolean;
}

export class CodeDiagramWrapper extends React.Component<CodeDiagramProps, {}> {
    private diagramReference: React.RefObject<ReactDiagram>;
    private $: any;

    constructor(props: CodeDiagramProps) {
        super(props);
        this.diagramReference = React.createRef();
        this.$ = go.GraphObject.make;
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

    componentDidMount() {
        // Should add listeners to the diagram (if needed).
    }
    componentWillUnmount() {
        // Should remove listeners from the diagram.
    }

    private initDiagram = (): go.Diagram => {
        const $ = go.GraphObject.make;
        // diagram
        const diagram = 
            $(go.Diagram, 
                {
                    model: $(go.GraphLinksModel, 
                    {
                        nodeKeyProperty: "key",
                        linkKeyProperty: "key",
                        linkFromPortIdProperty: "fromPort",
                        linkToPortIdProperty: "toPort",
                        nodeCategoryProperty: "category",
                        linkCategoryProperty: "category"
                    }),
                    layout: $(go.LayeredDigraphLayout, 
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
        diagram.groupTemplateMap.add(NodeType.PropertyHeader, this.methodHeaderGroupTemplate());
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
        diagram.linkTemplateMap.add(LinkType.CallableReturnType, this.linksToTypes());
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
            { selectable: false },
            this.$(go.TextBlock,
                { isMultiline: false, editable: false, stroke: "black" },
                new go.Binding("text", "value")) 
        );
    }
    private enumValuesContainerGroupTemplate = () => {
        return this.$(go.Group, "Table", { name: "Container" },
            { selectable: false },
            this.$(go.Shape, "RoundedRectangle", { fill: "white", stretch: go.GraphObject.Fill, strokeWidth: 2, columnSpan: 2 }),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 2) }),
            this.$(go.TextBlock, "Values",
                { font: "italic bold 10pt sans-serif", margin: 5 },
                new go.Binding("visible", "isSubGraphExpanded", (isSubGraphExpanded   => { return !isSubGraphExpanded} )).ofObject("Container")),
            this.$(go.Placeholder, { column: 0, margin: 5 }),
            this.$("SubGraphExpanderButton",
                { column: 1, margin: 5, alignment: go.Spot.TopRight, visible: true}),
        );
    }
    // access modifier template
    private accessModifierTemplate = () => {
        return this.$(go.Panel, "Horizontal",
            { margin: new go.Margin(0, 4, 0, 0) },
            this.$(go.TextBlock,
                {
                    name: "SYMBOL", visible: true, textAlign: "center", stroke: "blue", cursor: "pointer",
                    click: (e: any, node: any) => node.visible = false
                },
                new go.Binding("text", "", this.accessModifierToSymbol),
                new go.Binding("visible", "visible", (visible => !visible)).ofObject("ACCESSMODIFIER")),
            this.$(go.TextBlock,
                {
                    name: "ACCESSMODIFIER", visible: false, textAlign: "center", stroke: "blue", cursor: "pointer",
                    click: (e: any, node: any) => node.visible = false
                },
                new go.Binding("text", ""),
                new go.Binding("visible", "visible", (visible => !visible)).ofObject("SYMBOL")),
        );
    }
    // field templates
    private fieldNodeTemplate = () => {
        return this.$(go.Node, "Auto",
            { selectable: false },
            this.$(go.Shape, "RoundedRectangle", { fill: "white" }),
            this.$(go.Panel, "Horizontal",
                // field visibility access modifiers
                this.$(go.Panel, "Horizontal",
                    { stretch: go.GraphObject.Fill, defaultAlignment: go.Spot.Left, itemTemplate: this.accessModifierTemplate() },
                    new go.Binding("itemArray", "modifiers", this.filterViewableModifiers)),
                // field name
                this.$(go.TextBlock,
                    { margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: "green" },
                    new go.Binding("text", "name"),
                    new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
                // :
                this.$(go.TextBlock, ":"),
                // field type
                this.$(go.TextBlock, { stroke: "blue" },
                    new go.Binding("text", "type")))
        );
    }
    private fieldsContainerGroupTemplate = () => {
        return this.$(go.Group, "Table", { name: "Container" },
            { selectable: false },
            this.$(go.Shape, "RoundedRectangle", { fill: "white", stretch: go.GraphObject.Fill, strokeWidth: 2, columnSpan: 2 }),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 2) }),
            this.$(go.TextBlock, "Fields",
                { font: "italic bold 10pt sans-serif", margin: 5 },
                new go.Binding("visible", "isSubGraphExpanded", (isSubGraphExpanded   => { return !isSubGraphExpanded} )).ofObject("Container")),
            this.$(go.Placeholder, { column: 0, margin: 5, alignment: go.Spot.Left }),
            this.$("SubGraphExpanderButton",
                { column: 1, margin: 5, alignment: go.Spot.TopRight, visible: true}),
        );
    };
    // statement template
    private statementAtomTemplate = () => {
        return this.$(go.Panel, "Auto",
            this.$(go.TextBlock,
                { isMultiline: false, stretch: go.GraphObject.Fill, stroke: "blue", margin: new go.Margin(0, 3, 0, 0) },
                new go.Binding("text", "text"),
                new go.Binding("stroke", "semantic", semantic => this.mapStatementAtomSemanticToStroke(semantic))),
        );
    }
    private statementNodeTemplate = () => {
        return this.$(go.Node, "Horizontal",
            { selectable: false },
            this.$(go.Panel, 
                new go.Binding("width", "blockCount", blockCount => blockCount * 15)), //TODO: parameterize the value by which the width is computed
            this.$(go.Panel, "Horizontal",
                { 
                    stretch: go.GraphObject.Fill, defaultAlignment: go.Spot.Left,
                    itemTemplate: this.statementAtomTemplate()
                },
                new go.Binding("itemArray", "statementAtoms")),
        );
    }
    // parameter template
    private parameterNodeTemplate = () => {
        return this.$(go.Node, "Horizontal",
            { selectable: false },
            // parameter name
            this.$(go.TextBlock,
                { isMultiline: false, editable: false, stroke: "green" },
                new go.Binding("text", "name")),
            // :
            this.$(go.TextBlock, ":"),
            // parameter type
            this.$(go.TextBlock,
                { isMultiline: false, editable: false, stroke: "blue" },
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
                { isMultiline: false, editable: false, stroke: "black" },
                new go.Binding("text", ", "),
                new go.Binding("visible", "isLast", isLast => { return isLast !== true })),
        );
    }
    // property accessor templates
    private propertyAccessorHeaderGroupTemplate = () => {
        return this.$(go.Group, "Horizontal",
            { selectable: false },
            this.$(go.TextBlock,
                { isMultiline: false, editable: false, stroke: "black" },
                new go.Binding("text", "value")),
            this.$(go.GridLayout, { wrappingColumn: 5, spacing: new go.Size(0, 1) }), // TODO: revise wrapping column number
            this.$(go.Placeholder)
            );
    }
    private propertyAccessorBodyGroupTemplate = () => {
        return this.$(go.Group, "Horizontal",
            { selectable: false },
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 1) }),
            this.$(go.Placeholder)
            );
    }
    private propertyAccessorGroupTemplate = () => {
        return this.$(go.Group, "Table",
            { selectable: false },
            this.$(go.Shape, "RoundedRectangle", { fill: "white", stretch: go.GraphObject.Fill, rowSpan: 2 }),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 1) }),
            // method name
            this.$(go.TextBlock,
                { row: 0, margin: new go.Margin(2, 2, 0, 2), isMultiline: false, editable: false, stroke: "green", alignment: go.Spot.Left },
                new go.Binding("text", "name"),
                new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
            this.$(go.Placeholder, { row: 1, margin: new go.Margin(2, 2, 2, 4) }),
            );
    }
    // property templates
    private propertyGroupTemplate = () => {
        return this.$(go.Group, "Auto",
            this.$(go.Shape, "RoundedRectangle", { fill: "white" }, new go.Binding("portId", "portId")),
            this.$(go.Panel, "Table",
                // property visibility access modifiers
                this.$(go.Panel, "Horizontal",
                    { 
                        row: 0, column: 0, stretch: go.GraphObject.Fill, 
                        defaultAlignment: go.Spot.Left, opacity: 1, 
                        itemTemplate: this.accessModifierTemplate() 
                    },
                    new go.Binding("itemArray", "modifiers", this.filterViewableModifiers)),
                // property name
                this.$(go.TextBlock,
                    { 
                        row: 0, column: 1, margin: new go.Margin(0, 1, 0, 0), 
                        isMultiline: false, editable: false, stroke: "green" 
                    },
                    new go.Binding("text", "name"),
                    new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
                // :
                this.$(go.TextBlock, ":", { row: 0, column: 2 }),
                // property type
                this.$(go.TextBlock,
                    { 
                        row: 0, column: 3, stretch: go.GraphObject.Fill, 
                        isMultiline: false, editable: false, stroke: "blue" 
                    },
                    new go.Binding("text", "type")),
                // property accessors
                this.$(go.Placeholder, { name: "MEMBERS" },
                    { row: 1, margin: 3, stretch: go.GraphObject.Fill }),
                this.$("SubGraphExpanderButton", "MEMBERS",
                    { row: 1, column: 1, alignment: go.Spot.TopRight, visible: true}))
        );
    }
    private propertiesContainerGroupTemplate = () => {
        return this.$(go.Group, "Table", { name: "Container" },
            { selectable: false },
            this.$(go.Shape, "RoundedRectangle", { fill: "white", stretch: go.GraphObject.Fill, strokeWidth: 2, columnSpan: 2 }),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 2) }),
            this.$(go.TextBlock, "Properties",
                { font: "italic bold 10pt sans-serif", margin: 5 },
                new go.Binding("visible", "isSubGraphExpanded", (isSubGraphExpanded   => { return !isSubGraphExpanded} )).ofObject("Container")),
            this.$(go.Placeholder, { column: 0, margin: 5 }),
            this.$("SubGraphExpanderButton",
                { column: 1, margin: 5, alignment: go.Spot.TopRight, visible: true}),
        );
    };
    // type method templates
    private methodHeaderGroupTemplate = () => {
        return this.$(go.Group, "Table",
            { selectable: false, stretch: go.GraphObject.Fill },
            // method visibility access modifiers
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 1) }), // TODO: revise wrapping column number
            this.$(go.Panel, "Horizontal",
                new go.Binding("itemArray", "modifiers", this.filterViewableModifiers),
                {
                    row: 0, column: 0, stretch: go.GraphObject.Fill,
                    defaultAlignment: go.Spot.Left, opacity: 0.75,
                    itemTemplate: this.accessModifierTemplate()
                }),
            // method name
            this.$(go.TextBlock,
                { row: 0, column: 1, margin: new go.Margin(0, 2, 0, 0), isMultiline: false, editable: false, stroke: "orange", alignment: go.Spot.Left },
                new go.Binding("text", "name"),
                new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
            // (
            this.$(go.TextBlock, "(", { row: 0, column: 2, width: 5 }),
            // parameters placeholder
            this.$(go.Placeholder, { row: 0, column: 3 }),
            // )
            this.$(go.TextBlock, ")", { row: 0, column: 4, width: 5 }),
            // :
            this.$(go.TextBlock, ":", 
                { row:0, column: 5 },
                new go.Binding("visible", "", method => method.type !== undefined)),
            // method type
            this.$(go.TextBlock,
                { row: 0, column: 6, isMultiline: false, editable: false, stroke: "blue", alignment: go.Spot.Left },
                new go.Binding("text", "type")),
            );
    }
    private methodBodyGroupTemplate = () => {
        return this.$(go.Group, "Table",
            { selectable: false },
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
            { selectable: false },
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 1) }),
            this.$(go.Placeholder)
            );
    }
    private methodGroupTemplate = () => {
        return this.$(go.Group, "Auto",
            { selectable: false },
            this.$(go.Shape, "RoundedRectangle", { fill: "white" }),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 1) }),
            this.$(go.Placeholder),
            );
    }
    private methodsContainerGroupTemplate = (groupName: string) => {
        return this.$(go.Group, "Table", { name: "Container" },
            { selectable: false },
            this.$(go.Shape, "RoundedRectangle", { fill: "white", stretch: go.GraphObject.Fill, strokeWidth: 2, columnSpan: 2 }),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 2) }),
            this.$(go.TextBlock, groupName,
                { font: "italic bold 10pt sans-serif", margin: 5 },
                new go.Binding("visible", "isSubGraphExpanded", (isSubGraphExpanded   => { return !isSubGraphExpanded} )).ofObject("Container")),
            this.$(go.Placeholder, { column: 0, margin: 5, alignment: go.Spot.Left }),
            this.$("SubGraphExpanderButton",
                { column: 1, margin: 5, alignment: go.Spot.TopRight, visible: true}),
        );
    }

    // type templates (classes, structs, interfaces, enums)
    private classGroupTemplate = () => {
        return this.$(go.Group, "Auto",
            { locationSpot: go.Spot.Center },
            this.$(go.Shape, "RoundedRectangle", { fill: "white", stretch: go.GraphObject.Fill, strokeWidth: 2, rowSpan: 2 }),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 2) }),
            this.$(go.Panel, "Table",
                { defaultRowSeparatorStroke: "black" },
                // class name
                this.$(go.TextBlock,
                    {
                        row: 0, margin: 3, alignment: go.Spot.Center,
                        font: "bold 12pt sans-serif",
                        isMultiline: false, editable: false
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
            { locationSpot: go.Spot.Center },
            this.$(go.Shape, "RoundedRectangle", { fill: "white", strokeWidth: 2 }),
            this.$(go.GridLayout, { wrappingColumn: 1, spacing: new go.Size(0, 2) }),
            this.$(go.Panel, "Table",
                { defaultRowSeparatorStroke: "black" },
                // enum name
                this.$(go.TextBlock,
                    {
                        row: 0, margin: 3, alignment: go.Spot.Center,
                        isMultiline: false, editable: false,
                        font: "bold 12pt sans-serif",
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
                toSpot: go.Spot.BottomSide
            },
            this.$(go.Shape, new go.Binding("strokeDashArray", "category", category => category === LinkType.Realization? [4, 2]: [])),
            this.$(go.Shape, { toArrow: "Triangle", fill: "white" })
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
                toSpot: go.Spot.LeftSide
            },
            this.$(go.Shape, { stroke: "blue" }),
            this.$(go.Shape, { toArrow: "Standard", fill: "blue" }),
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
                toSpot: go.Spot.LeftSide
            },
            this.$(go.Shape, { stroke: "orange" }),
            this.$(go.Shape, { toArrow: "Standard", fill: "orange" }),
        );
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
    private markLastItemAsLast = (parameters: string[]) => {
        return parameters.map((parameter: any) => {
            return {
                ...parameter,
                isLast: parameters.indexOf(parameter) == parameters.length - 1
            };
        });
    }
    private mapStatementAtomSemanticToStroke = (semantic: string): string => {
        switch (semantic) {
            case StatementAtomSemantic.FieldOrProperty: return "green";
            case StatementAtomSemantic.Constructor: return "orange";
            case StatementAtomSemantic.Method: return "orange";
            case StatementAtomSemantic.Type: return "blue";
            default: return "black";
        }
    }
    
    // helper functions
    private jsonEqual = (a: any, b: any) => this.jsonStringifyWithoutGoHashId(a) === this.jsonStringifyWithoutGoHashId(b);
    private jsonStringifyWithoutGoHashId = (a: any) => JSON.stringify(a, (key, value) => {
        if (key === "__gohashid") return undefined;
        return value;
    });

    render() {
        return (
            <ReactDiagram
                ref={this.diagramReference}
                divClassName='code-diagram-component'
                initDiagram={this.initDiagram}
                nodeDataArray={this.props.nodeDataArray}
                linkDataArray={this.props.linkDataArray}
                modelData={this.props.modelData}
                onModelChange={() => {console.log('for now, we do nothing when model changes')}}
                skipsDiagramUpdate={this.props.skipsDiagramUpdate}
            />
        )
    }
}

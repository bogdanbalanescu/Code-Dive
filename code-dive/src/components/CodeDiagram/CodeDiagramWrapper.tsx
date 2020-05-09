import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';

import './CodeDiagramWrapper.css';
import { isDeepStrictEqual } from 'util';
import { LinkType } from './LinkType';

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

    componentDidUpdate(prevProps: CodeDiagramProps, prevState: any, prevContext: any) {
        if (this.props.nodeDataArray !== prevProps.nodeDataArray && this.diagramReference.current != null) {
            let diagram = this.diagramReference.current.getDiagram();
            if (diagram != null) {
                diagram.startTransaction();
                prevProps.linkDataArray.forEach(previousLink => {
                    if (diagram == null) return;
                    if (this.props.linkDataArray.findIndex(currentLink => isDeepStrictEqual(previousLink, currentLink)) !== -1) { // if link no longer exists or was modified, delete it
                        var link = diagram.findLinkForKey(previousLink.key);
                        if (link !== null) diagram.remove(link as go.Link);
                    }
                });
                prevProps.nodeDataArray.forEach(previousNode => {
                    if (diagram == null) return;
                    if (this.props.nodeDataArray.findIndex(currentNode => isDeepStrictEqual(previousNode, currentNode)) !== -1) { // if node no longer exists or was modified, delete it
                        var node = diagram.findNodeForKey(previousNode.key);
                        if (node !== null) diagram.remove(node as go.Node);
                    }
                })
                this.props.nodeDataArray.forEach(currentNode => {
                    if (diagram == null) return;
                    if (prevProps.nodeDataArray.findIndex(previousNode => isDeepStrictEqual(previousNode, currentNode)) === -1) {
                        diagram.model.addNodeData(currentNode);
                    }
                })
                this.props.linkDataArray.forEach(currentLink => {
                    if (diagram == null) return;
                    if (prevProps.linkDataArray.findIndex(previousLink => isDeepStrictEqual(previousLink, currentLink)) === -1) {
                        (diagram.model as go.GraphLinksModel).addLinkData(currentLink);
                    }
                });
                // TODO: the above logic can be improved to only update what is necessary for better performance.
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
                        layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource,
                        initializeOption: go.LayeredDigraphLayout.InitDepthFirstOut,
                        aggressiveOption: go.LayeredDigraphLayout.AggressiveNone,
                        packOption: go.LayeredDigraphLayout.PackAll,
                        setsPortSpots: false
                    })
                });

        // type node templates
        diagram.nodeTemplateMap.add("class", this.classNodeTemplate());
        diagram.nodeTemplateMap.add("struct", this.classNodeTemplate());
        diagram.nodeTemplateMap.add("interface", this.classNodeTemplate());
        diagram.nodeTemplateMap.add("enum", this.enumNodeTemplate());

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

    // type members and member components templates
    private valueTemplate = () => {
        return this.$(go.Panel, "Horizontal",
            new go.Binding("portId", "portId"),
            this.$(go.TextBlock,
                { isMultiline: false, editable: false, stroke: "black" },
                new go.Binding("text", "value")) 
        );
    }
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
    private fieldTemplate = () => {
        return this.$(go.Panel, "Auto",
            this.$(go.Shape, "RoundedRectangle", { fill: "white" }, new go.Binding("portId", "portId")),
            this.$(go.Panel, "Table",
                // field visibility access modifiers
                this.$(go.Panel, "Horizontal",
                    new go.Binding("itemArray", "modifiers", this.filterViewableModifiers),
                    {
                        row: 0, column: 0, stretch: go.GraphObject.Fill,
                        defaultAlignment: go.Spot.Left, opacity: 1,
                        itemTemplate: this.accessModifierTemplate()
                    }),
                // field name
                this.$(go.TextBlock,
                    { row: 0, column: 1, margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: "green" },
                    new go.Binding("text", "name"),
                    new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
                // :
                this.$(go.TextBlock, ":", { row: 0, column: 2 }),
                // field type
                this.$(go.TextBlock,
                    { row: 0, column: 3, stroke: "blue" },
                    new go.Binding("text", "type")))
        );
    }
    private statementTemplate = () => {
        return this.$(go.Panel, "Horizontal",
            new go.Binding("portId", "portId"),
            this.$(go.TextBlock,
                { isMultiline: false, editable: false, stroke: "black" },
                new go.Binding("text", "statementText")) 
                // TODO: see if we can make keywords and operators blue and fields, properties, constructors and methods green
                // may need to also make a few adjustments to the code parser 
                // (idea: return a string array with the atoms in a statement)
        );
    }
    private parameterTemplate = () => {
        return this.$(go.Panel, "Horizontal",
            new go.Binding("portId", "portId"),
            // parameter name
            this.$(go.TextBlock,
                { isMultiline: false, editable: false, stroke: "green" },
                new go.Binding("text", "name")),
            // :
            this.$(go.TextBlock, ":"),
            // parameter type
            this.$(go.TextBlock,
                { isMultiline: false, editable: false, stroke: "blue" },
                new go.Binding("text", "type")),
            // ,
            this.$(go.TextBlock, ", ",
                { isMultiline: false, editable: false, stroke: "black" },
                new go.Binding("text", ", "),
                new go.Binding("visible", "isLast", isLast => { return isLast !== true }))
        );
    }
    private propertyAccessorTemplate = () => {
        return this.$(go.Panel, "Auto",
            this.$(go.Shape, "RoundedRectangle", { fill: "white" }),
            this.$(go.Panel, "Table",
                { defaultRowSeparatorStroke: "black" },
                // accessor type (get or set)
                this.$(go.TextBlock,
                    { row: 0, column: 0, margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: "blue", alignment: go.Spot.Left },
                    new go.Binding("text", "name")),
                // [
                this.$(go.TextBlock, "[", { row: 0, column: 1, width: 5 },
                    new go.Binding("visible", "parameters", parameters => parameters.length > 0)),
                // method parameters
                this.$(go.Panel, "Horizontal",
                    new go.Binding("itemArray", "parameters", this.markLastItemAsLast),
                    {
                        row: 0, column: 2, stretch: go.GraphObject.Fill,
                        defaultAlignment: go.Spot.Left,
                        itemTemplate: this.parameterTemplate()
                    }),
                // ]
                this.$(go.TextBlock, "]", { row: 0, column: 3, width: 5 },
                new go.Binding("visible", "parameters", parameters => parameters.length > 0)),
                // statements
                this.$(go.Panel, "Vertical",
                    new go.Binding("itemArray", "body"), 
                    {
                        row: 1, columnSpan: 4, stretch: go.GraphObject.Fill, // TODO increase the column span if you add more columns up top
                        defaultAlignment: go.Spot.Left,
                        itemTemplate: this.statementTemplate()
                    })
            )
        );
    }
    private propertyTemplate = () => {
        return this.$(go.Panel, "Auto",
            this.$(go.Shape, "RoundedRectangle", { fill: "white" }, new go.Binding("portId", "portId")),
            this.$(go.Panel, "Table",
                // property visibility access modifiers
                this.$(go.Panel, "Horizontal",
                    new go.Binding("itemArray", "modifiers", this.filterViewableModifiers),
                    {
                        row: 0, column: 0, stretch: go.GraphObject.Fill,
                        defaultAlignment: go.Spot.Left, opacity: 1,
                        itemTemplate: this.accessModifierTemplate()
                    }),
                // property name
                this.$(go.TextBlock,
                    { row: 0, column: 1, margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: "green" },
                    new go.Binding("text", "name"),
                    new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
                // :
                this.$(go.TextBlock, ":", { row: 0, column: 2 }),
                // property type
                this.$(go.TextBlock,
                    { row: 0, column: 3, stroke: "blue" },
                    new go.Binding("text", "type")),
                // property accessors
                this.$(go.Panel, "Vertical",
                    new go.Binding("itemArray", "accessors"), 
                    {
                        row: 1, columnSpan: 5, stretch: go.GraphObject.Fill, // TODO increase the column span if you add more columns up top
                        defaultAlignment: go.Spot.Left,
                        itemTemplate: this.propertyAccessorTemplate()
                    }))
        );
    }
    private methodTemplate = () => {
        return this.$(go.Panel, "Auto",
            this.$(go.Shape, "RoundedRectangle", { fill: "white" }, new go.Binding("portId", "portId")),
            this.$(go.Panel, "Table",
                { defaultRowSeparatorStroke: "black" },
                // method visibility access modifiers
                this.$(go.Panel, "Horizontal",
                    new go.Binding("itemArray", "modifiers", this.filterViewableModifiers),
                    {
                        row: 0, column: 0, stretch: go.GraphObject.Fill,
                        defaultAlignment: go.Spot.Left, opacity: 0.75,
                        itemTemplate: this.accessModifierTemplate()
                    }),
                // method name
                this.$(go.TextBlock,
                    { row: 0, column: 1, margin: new go.Margin(0, 2, 0, 0), isMultiline: false, editable: false, stroke: "green", alignment: go.Spot.Left },
                    new go.Binding("text", "name"),
                    new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
                // (
                    this.$(go.TextBlock, "(", { row: 0, column: 2, width: 5 }),
                // method parameters
                this.$(go.Panel, "Horizontal",
                    new go.Binding("itemArray", "parameters", this.markLastItemAsLast),
                    {
                        row: 0, column: 3, stretch: go.GraphObject.Fill,
                        defaultAlignment: go.Spot.Left,
                        itemTemplate: this.parameterTemplate()
                    }),
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
                // method statements
                this.$(go.Panel, "Vertical",
                    new go.Binding("itemArray", "statements"), 
                    {
                        row: 1, columnSpan: 7, stretch: go.GraphObject.Fill, // TODO increase the column span if you add more columns up top
                        defaultAlignment: go.Spot.Left,
                        itemTemplate: this.statementTemplate()
                    })
            )
        );
    }

    // type templates (classes, structs, interfaces, enums)
    private classNodeTemplate = () => {
        return this.$(go.Node, "Auto", 
            { locationSpot: go.Spot.Center },
            new go.Binding("portId", "portId"),
            this.$(go.Shape, "RoundedRectangle", { fill: "white" }),
            this.$(go.Panel, "Table",
                { defaultRowSeparatorStroke: "black" },
                // class name
                this.$(go.TextBlock,
                    {
                        row: 0, columnSpan: 2, margin: 3, alignment: go.Spot.Center,
                        font: "bold 12pt sans-serif",
                        isMultiline: false, editable: false
                    },
                    new go.Binding("text", "name")),
                // fields
                this.$(go.TextBlock, "Fields",
                    { row: 1, font: "italic 10pt sans-serif" },
                    new go.Binding("visible", "visible", (visible => !visible)).ofObject("FIELDS")),
                this.$(go.Panel, "Vertical", { name: "FIELDS" },
                    new go.Binding("itemArray", "fields"),
                    {
                        row: 1, margin: 3, stretch: go.GraphObject.Fill,
                        defaultAlignment: go.Spot.Left,
                        itemTemplate: this.fieldTemplate()
                    }),
                this.$("PanelExpanderButton", "FIELDS",
                    { row: 1, column: 1, alignment: go.Spot.TopRight, visible: false},
                    new go.Binding("visible", "fields", fields => fields.length > 0)),
                // properties
                this.$(go.TextBlock, "Properties",
                    { row: 2, font: "italic 10pt sans-serif" },
                    new go.Binding("visible", "visible", (visible => !visible)).ofObject("PROPERTIES")),
                this.$(go.Panel, "Vertical", { name: "PROPERTIES" },
                    new go.Binding("itemArray", "properties"),
                    {
                        row: 2, margin: 3, stretch: go.GraphObject.Fill,
                        defaultAlignment: go.Spot.Left,
                        itemTemplate: this.propertyTemplate()
                    }),
                this.$("PanelExpanderButton", "PROPERTIES",
                    { row: 2, column: 1, alignment: go.Spot.TopRight, visible: false},
                    new go.Binding("visible", "properties", properties => properties.length > 0)),
                // constructors
                this.$(go.TextBlock, "Constructors",
                    { row: 3, font: "italic 10pt sans-serif" },
                    new go.Binding("visible", "visible", (visible => !visible)).ofObject("CONSTRUCTORS")),
                this.$(go.Panel, "Vertical", { name: "CONSTRUCTORS" },
                    new go.Binding("itemArray", "constructors"),
                    {
                        row: 3, margin: 3, stretch: go.GraphObject.Fill,
                        defaultAlignment: go.Spot.Left,
                        itemTemplate: this.methodTemplate()
                    }),
                this.$("PanelExpanderButton", "CONSTRUCTORS",
                    { row: 3, column: 1, alignment: go.Spot.TopRight, visible: false},
                    new go.Binding("visible", "constructors", constructors => constructors.length > 0)),
                // methods
                this.$(go.TextBlock, "Methods",
                    { row: 4, font: "italic 10pt sans-serif" },
                    new go.Binding("visible", "visible", (visible => !visible)).ofObject("METHODS")),
                this.$(go.Panel, "Vertical", { name: "METHODS" },
                    new go.Binding("itemArray", "methods"),
                    {
                        row: 4, margin: 3, stretch: go.GraphObject.Fill,
                        defaultAlignment: go.Spot.Left,
                        itemTemplate: this.methodTemplate()
                    }),
                this.$("PanelExpanderButton", "METHODS",
                    { row: 4, column: 1, alignment: go.Spot.TopRight, visible: false},
                    new go.Binding("visible", "methods", methods => methods.length > 0)),
            )
        );
    }
    private enumNodeTemplate = () => {
        return this.$(go.Node, "Auto",
            { locationSpot: go.Spot.Center },
            new go.Binding("portId", "portId"),
            this.$(go.Shape, "RoundedRectangle", { fill: "white" }),
            this.$(go.Panel, "Table",
                { defaultRowSeparatorStroke: "black" },
                // enum name
                this.$(go.TextBlock,
                    {
                        row: 0, columnSpan: 2, margin: 3, alignment: go.Spot.Center,
                        font: "bold 12pt sans-serif",
                        isMultiline: false, editable: false
                    },
                    new go.Binding("text", "name")),
                // values
                this.$(go.TextBlock, "Values",
                    { row: 4, font: "italic 10pt sans-serif" },
                    new go.Binding("visible", "visible", (visible => !visible)).ofObject("VALUES")),
                this.$(go.Panel, "Vertical", { name: "VALUES" },
                    new go.Binding("itemArray", "values"),
                    {
                        row: 4, margin: 3, stretch: go.GraphObject.Fill,
                        defaultAlignment: go.Spot.Left,
                        itemTemplate: this.valueTemplate()
                    }),
                this.$("PanelExpanderButton", "VALUES",
                    { row: 4, column: 1, alignment: go.Spot.TopRight, visible: false},
                    new go.Binding("visible", "values", values => values.length > 0)),
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

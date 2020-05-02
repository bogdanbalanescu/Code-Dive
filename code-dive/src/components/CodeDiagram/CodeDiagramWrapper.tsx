import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';

import './CodeDiagramWrapper.css';
import { isDeepStrictEqual } from 'util';

interface CodeDiagramProps { 
    nodeDataArray: Array<go.ObjectData>;
    linkDataArray: Array<go.ObjectData>;
    modelData: go.ObjectData;
    skipsDiagramUpdate: boolean;
}

export class CodeDiagramWrapper extends React.Component<CodeDiagramProps, {}> {
    private diagramReference: React.RefObject<ReactDiagram>;

    constructor(props: CodeDiagramProps) {
        super(props);
        this.diagramReference = React.createRef();
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

    private initDiagram(): go.Diagram {
        const $ = go.GraphObject.make;
        // diagram
        const diagram = 
            $(go.Diagram, 
                {
                    model: $(go.GraphLinksModel, 
                    {
                        nodeKeyProperty: "key",
                        linkKeyProperty: "key",
                        linkFromPortIdProperty: "fromPort", // required information:
                        linkToPortIdProperty: "toPort",     // identifies data property names
                    }),
                    layout: $(go.LayeredDigraphLayout, 
                    {
                        direction: 0,
                        layerSpacing: 25,
                        columnSpacing: 25,
                        cycleRemoveOption: go.LayeredDigraphLayout.CycleGreedy,
                        layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource,
                        initializeOption: go.LayeredDigraphLayout.InitDepthFirstOut,
                        aggressiveOption: go.LayeredDigraphLayout.AggressiveLess,
                        packOption: go.LayeredDigraphLayout.PackExpand,
                        setsPortSpots: true
                    })
                });
        
        const accessModifierToSymbol = (accessModifier: string) => {
            switch (accessModifier) {
                case "public": return "+";
                case "private": return "-";
                case "protected": return "#";
                case "internal": return "~";
                default: return "";
            }; 
        }

        const symbolToAccessModifier = (symbol: string) => {
            switch(symbol) {
                case "+": return "public";
                case "-": return "private";
                case "#": return "protected";
                case "~": return "internal";
                default: return "";
            };
        }

        const filterViewablemodifiers = (modifiers: string[]) => {
            return modifiers.filter((modifier: string) => {
                return ["public", "private", "protected", "internal"].includes(modifier);
            })
        }

        // access modifier template
        var accessModifierTemplate = 
            $(go.Panel, "Horizontal",
                { margin: new go.Margin(0, 4, 0, 0) },
                $(go.TextBlock,
                    {
                        name: "SYMBOL", visible: true, textAlign: "center", stroke: "blue", cursor: "pointer",
                        click: (e: any, node: any) => node.visible = false
                    },
                    new go.Binding("text", "", accessModifierToSymbol),
                    new go.Binding("visible", "visible", (visible => !visible)).ofObject("ACCESSMODIFIER")),
                $(go.TextBlock,
                    {
                        name: "ACCESSMODIFIER", visible: false, textAlign: "center", stroke: "blue", cursor: "pointer",
                        click: (e: any, node: any) => node.visible = false
                    },
                    new go.Binding("text", ""),
                    new go.Binding("visible", "visible", (visible => !visible)).ofObject("SYMBOL")),
            );

        // field template
        var fieldTemplate = 
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", { fill: "white" },
                {
                    fromSpot: go.Spot.TopSide,
                    toSpot: go.Spot.BottomSide
                },
                new go.Binding("portId", "portId")),
                $(go.Panel, "Table",
                    // field visibility access modifiers
                    $(go.Panel, "Horizontal",
                        new go.Binding("itemArray", "modifiers", filterViewablemodifiers),
                        {
                            row: 0, column: 0, stretch: go.GraphObject.Fill,
                            defaultAlignment: go.Spot.Left, opacity: 1,
                            itemTemplate: accessModifierTemplate
                        }),
                    // field name
                    $(go.TextBlock,
                        { row: 0, column: 1, margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: "green" },
                        new go.Binding("text", "name"),
                        new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
                    // :
                    $(go.TextBlock, ":", { row: 0, column: 2 }),
                    // field type
                    $(go.TextBlock,
                        { row: 0, column: 3, stroke: "blue" },
                        new go.Binding("text", "type")))
            );

        // statement template
        var statementTemplate =
            $(go.Panel, "Horizontal",
                {
                    fromSpot: go.Spot.TopSide,
                    toSpot: go.Spot.BottomSide
                },
                new go.Binding("portId", "portId"),
                $(go.TextBlock,
                    { isMultiline: false, editable: false, stroke: "black" },
                    new go.Binding("text", "statementText")) 
                    // TODO: see if we can make keywords and operators blue and fields, properties, constructors and methods green
                    // may need to also make a few adjustments to the code parser 
                    // (idea: return a string array with the atoms in a statement)
            );

        // accessor template
        var accessorTemplate =
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", { fill: "white" }),
                $(go.Panel, "Table",
                    { defaultRowSeparatorStroke: "black" },
                    // accessor type (get or set)
                    $(go.TextBlock,
                        { row: 0, margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: "blue", alignment: go.Spot.Left },
                        new go.Binding("text", "type")),
                    // statements
                    $(go.Panel, "Vertical",
                        new go.Binding("itemArray", "body"), 
                        {
                            row: 1, columnSpan: 4, stretch: go.GraphObject.Fill, // TODO increase the column span if you add more columns up top
                            defaultAlignment: go.Spot.Left,
                            itemTemplate: statementTemplate
                        })
                )
            );
        
        // property template
        var propertyTemplate =
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", { fill: "white" },
                {
                    fromSpot: go.Spot.TopSide,
                    toSpot: go.Spot.BottomSide
                },
                new go.Binding("portId", "portId")),
                $(go.Panel, "Table",
                    // property visibility access modifiers
                    $(go.Panel, "Horizontal",
                        new go.Binding("itemArray", "modifiers", filterViewablemodifiers),
                        {
                            row: 0, column: 0, stretch: go.GraphObject.Fill,
                            defaultAlignment: go.Spot.Left, opacity: 1,
                            itemTemplate: accessModifierTemplate
                        }),
                    // property name
                    $(go.TextBlock,
                        { row: 0, column: 1, margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: "green" },
                        new go.Binding("text", "name"),
                        new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
                    // :
                    $(go.TextBlock, ":", { row: 0, column: 2 }),
                    // property type
                    $(go.TextBlock,
                        { row: 0, column: 3, stroke: "blue" },
                        new go.Binding("text", "type")),
                    // property accessors
                    $(go.Panel, "Vertical",
                        new go.Binding("itemArray", "accessors"), 
                        {
                            row: 1, columnSpan: 5, stretch: go.GraphObject.Fill, // TODO increase the column span if you add more columns up top
                            defaultAlignment: go.Spot.Left,
                            itemTemplate: accessorTemplate
                        }))
            );

        const markLastItemAsLast = (parameters: string[]) => {
            return parameters.map((parameter: any) => {
                return {
                    ...parameter,
                    isLast: parameters.indexOf(parameter) == parameters.length - 1
                };
            });
        }

        // method parameter template
        var methodParameterTemplate = 
                $(go.Panel, "Horizontal",
                {
                    fromSpot: go.Spot.TopSide,
                    toSpot: go.Spot.BottomSide,
                },
                new go.Binding("portId", "portId"),
                // parameter name
                $(go.TextBlock,
                    { isMultiline: false, editable: false, stroke: "green" },
                    new go.Binding("text", "name")),
                // :
                $(go.TextBlock, ":"),
                // parameter type
                $(go.TextBlock,
                    { isMultiline: false, editable: false, stroke: "blue" },
                    new go.Binding("text", "type")),
                // ,
                $(go.TextBlock, ", ",
                    { isMultiline: false, editable: false, stroke: "black" },
                    new go.Binding("text", ", "),
                    new go.Binding("visible", "isLast", isLast => { return isLast !== true }))
            );

        // method template
        var methodTemplate =
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", { fill: "white" },
                {
                    fromSpot: go.Spot.TopSide,
                    toSpot: go.Spot.BottomSide
                },
                new go.Binding("portId", "portId")),
                $(go.Panel, "Table",
                    { defaultRowSeparatorStroke: "black" },
                    // method visibility access modifiers
                    $(go.Panel, "Horizontal",
                        new go.Binding("itemArray", "modifiers", filterViewablemodifiers),
                        {
                            row: 0, column: 0, stretch: go.GraphObject.Fill,
                            defaultAlignment: go.Spot.Left, opacity: 0.75,
                            itemTemplate: accessModifierTemplate
                        }),
                    // method name
                    $(go.TextBlock,
                        { row: 0, column: 1, margin: new go.Margin(0, 2, 0, 0), isMultiline: false, editable: false, stroke: "green", alignment: go.Spot.Left },
                        new go.Binding("text", "name"),
                        new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
                    // (
                    $(go.TextBlock, "(", { row: 0, column: 2, width: 5 }),
                    // method parameters
                    $(go.Panel, "Horizontal",
                        new go.Binding("itemArray", "parameters", markLastItemAsLast),
                        {
                            row: 0, column: 3, stretch: go.GraphObject.Fill,
                            defaultAlignment: go.Spot.Left,
                            itemTemplate: methodParameterTemplate
                        }),
                    // )
                    $(go.TextBlock, ")", { row: 0, column: 4, width: 5 }),
                    // :
                    $(go.TextBlock, ":", 
                        { row:0, column: 5 },
                        new go.Binding("visible", "", method => method.type !== undefined)),
                    // method type
                    $(go.TextBlock,
                        { row: 0, column: 6, isMultiline: false, editable: false, stroke: "blue", alignment: go.Spot.Left },
                        new go.Binding("text", "type")),
                    // method statements
                    $(go.Panel, "Vertical",
                        new go.Binding("itemArray", "statements"), 
                        {
                            row: 1, columnSpan: 7, stretch: go.GraphObject.Fill, // TODO increase the column span if you add more columns up top
                            defaultAlignment: go.Spot.Left,
                            itemTemplate: statementTemplate
                        })
                )
            );

        // class node template
        diagram.nodeTemplate = 
            $(go.Node, "Auto",
                {
                    locationSpot: go.Spot.Center,
                    fromSpot: go.Spot.TopSide,
                    toSpot: go.Spot.BottomSide
                },
                new go.Binding("portId", "portId"),
                $(go.Shape, "RoundedRectangle", { fill: "white" }),
                $(go.Panel, "Table",
                    { defaultRowSeparatorStroke: "black" },
                    // class name
                    $(go.TextBlock,
                        {
                            row: 0, columnSpan: 2, margin: 3, alignment: go.Spot.Center,
                            font: "bold 12pt sans-serif",
                            isMultiline: false, editable: false
                        },
                        new go.Binding("text", "name")),
                    // fields
                    $(go.TextBlock, "Fields",
                        { row: 1, font: "italic 10pt sans-serif" },
                        new go.Binding("visible", "visible", (visible => !visible)).ofObject("FIELDS")),
                    $(go.Panel, "Vertical", { name: "FIELDS" },
                        new go.Binding("itemArray", "fields"),
                        {
                            row: 1, margin: 3, stretch: go.GraphObject.Fill,
                            defaultAlignment: go.Spot.Left,
                            itemTemplate: fieldTemplate
                        }),
                    $("PanelExpanderButton", "FIELDS",
                        { row: 1, column: 1, alignment: go.Spot.TopRight, visible: false},
                        new go.Binding("visible", "fields", fields => fields.length > 0)),
                    // properties
                    $(go.TextBlock, "Properties",
                        { row: 2, font: "italic 10pt sans-serif" },
                        new go.Binding("visible", "visible", (visible => !visible)).ofObject("PROPERTIES")),
                    $(go.Panel, "Vertical", { name: "PROPERTIES" },
                        new go.Binding("itemArray", "properties"),
                        {
                            row: 2, margin: 3, stretch: go.GraphObject.Fill,
                            defaultAlignment: go.Spot.Left,
                            itemTemplate: propertyTemplate
                        }),
                    $("PanelExpanderButton", "PROPERTIES",
                        { row: 2, column: 1, alignment: go.Spot.TopRight, visible: false},
                        new go.Binding("visible", "properties", properties => properties.length > 0)),
                    // constructors
                    $(go.TextBlock, "Constructors",
                        { row: 3, font: "italic 10pt sans-serif" },
                        new go.Binding("visible", "visible", (visible => !visible)).ofObject("CONSTRUCTORS")),
                    $(go.Panel, "Vertical", { name: "CONSTRUCTORS" },
                        new go.Binding("itemArray", "constructors"),
                        {
                            row: 3, margin: 3, stretch: go.GraphObject.Fill,
                            defaultAlignment: go.Spot.Left,
                            itemTemplate: methodTemplate
                        }),
                    $("PanelExpanderButton", "CONSTRUCTORS",
                        { row: 3, column: 1, alignment: go.Spot.TopRight, visible: false},
                        new go.Binding("visible", "constructors", constructors => constructors.length > 0)),
                    // methods
                    $(go.TextBlock, "Methods",
                        { row: 4, font: "italic 10pt sans-serif" },
                        new go.Binding("visible", "visible", (visible => !visible)).ofObject("METHODS")),
                    $(go.Panel, "Vertical", { name: "METHODS" },
                        new go.Binding("itemArray", "methods"),
                        {
                            row: 4, margin: 3, stretch: go.GraphObject.Fill,
                            defaultAlignment: go.Spot.Left,
                            itemTemplate: methodTemplate
                        }),
                    $("PanelExpanderButton", "METHODS",
                        { row: 4, column: 1, alignment: go.Spot.TopRight, visible: false},
                        new go.Binding("visible", "methods", methods => methods.length > 0)),
                )
            );

        return diagram;
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

import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';

import './CodeDiagramWrapper.css';
import { access } from 'fs';

interface CodeDiagramProps { 
    nodeDateArray: Array<go.ObjectData>;
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
                        linkFromPortIdProperty: "fromPort", // required information:
                        linkToPortIdProperty: "toPort",      // identifies data property names
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
                $(go.Shape, "RoundedRectangle", { fill: "white" }),
                $(go.Panel, "Table",
                    // field visibility access modifiers
                    $(go.Panel, "Horizontal",
                        new go.Binding("itemArray", "modifiers", filterViewablemodifiers),
                        {
                            row: 0, column: 0, stretch: go.GraphObject.Fill,
                            defaultAlignment: go.Spot.Left, opacity: 0.75,
                            itemTemplate: accessModifierTemplate
                        }),
                    // field name
                    $(go.TextBlock,
                        { row: 0, column: 1, margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: "green" },
                        new go.Binding("text", "name"),
                        new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
                    // field type
                    $(go.TextBlock,
                        { row: 0, column: 2, stroke: "blue" },
                        new go.Binding("text", "type", type => `: ${type}` )))
            );

        const markLastItemAsLast = (parameters: string[]) => {
            return parameters.map((parameter: any) => {
                return {
                    name: parameter.name,
                    type: parameter.type,
                    isLast: parameters.indexOf(parameter) == parameters.length - 1
                };
            });
        }

        var statementTemplate =
            $(go.Panel, "Horizontal",
                $(go.TextBlock,
                    { row: 0, column: 0, isMultiline: false, editable: false, stroke: "black" },
                    new go.Binding("text", "statementText"))
            );

        var accessorTemplate =
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", { fill: "white" }),
                $(go.Panel, "Table",
                    { defaultRowSeparatorStroke: "black" },
                    // method name
                    $(go.TextBlock,
                        { row: 0, column: 1, margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: "blue", alignment: go.Spot.Left },
                        new go.Binding("text", "type")),
                    $(go.Panel, "Vertical",
                        new go.Binding("itemArray", "body"), 
                        {
                            row: 1, columnSpan: 4, stretch: go.GraphObject.Fill, // TODO increase the column span if you add more columns up top
                            defaultAlignment: go.Spot.Left,
                            itemTemplate: statementTemplate
                        })
                )
            );
        
        var propertyTemplate =
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", { fill: "white" }),
                $(go.Panel, "Table",
                    // property visibility access modifiers
                    $(go.Panel, "Horizontal",
                        new go.Binding("itemArray", "modifiers", filterViewablemodifiers),
                        {
                            row: 0, column: 0, stretch: go.GraphObject.Fill,
                            defaultAlignment: go.Spot.Left, opacity: 0.75,
                            itemTemplate: accessModifierTemplate
                        }),
                    // property name
                    $(go.TextBlock,
                        { row: 0, column: 1, margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: "green" },
                        new go.Binding("text", "name"),
                        new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
                    // property type
                    $(go.TextBlock,
                        { row: 0, column: 2, stroke: "blue" },
                        new go.Binding("text", "type", type => `: ${type}` )),
                    // property accessors
                    $(go.Panel, "Vertical",
                        new go.Binding("itemArray", "accessors"), 
                        {
                            row: 1, columnSpan: 5, stretch: go.GraphObject.Fill, // TODO increase the column span if you add more columns up top
                            defaultAlignment: go.Spot.Left,
                            itemTemplate: accessorTemplate
                        }))
            );

        var methodParameterTemplate = 
            $(go.Panel, "Horizontal",
                $(go.TextBlock,
                    { row: 0, column: 0, isMultiline: false, editable: false, stroke: "green" },
                    new go.Binding("text", "name")),
                $(go.TextBlock,
                    { row: 0, column: 0, isMultiline: false, editable: false, stroke: "blue" },
                    new go.Binding("text", "type", type => `: ${type}`)),
                $(go.TextBlock, ", ",
                    { row: 0, column: 0, isMultiline: false, editable: false, stroke: "black" },
                    new go.Binding("text", ", "),
                    new go.Binding("visible", "isLast", isLast => { return isLast !== true }))
            );

        // method template
        var methodTemplate =
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", { fill: "white" }),
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
                        { row: 0, column: 1, margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: "green", alignment: go.Spot.Left },
                        new go.Binding("text", "name", name => `${name}(`),
                        new go.Binding("isUnderline", "modifiers", modifiers => modifiers.includes("static"))),
                    // method parameters
                    $(go.Panel, "Horizontal",
                        new go.Binding("itemArray", "parameters", markLastItemAsLast),
                        {
                            row: 0, column: 2, stretch: go.GraphObject.Fill, name: "METHODPARAMETERS",
                            defaultAlignment: go.Spot.Left, opacity: 0.75,
                            itemTemplate: methodParameterTemplate
                        }),
                    $(go.TextBlock, ")", { row:0, column:4, isMultiline: false, editable: false, stroke: "green", alignment: go.Spot.Left }),
                    // method type
                    $(go.TextBlock,
                        { row: 0, column: 5, margin: new go.Margin(0, 1, 0, 0), isMultiline: false, editable: false, stroke: "blue", alignment: go.Spot.Left },
                        new go.Binding("text", "type", type => `: ${type}`)),
                    // method statements
                    $(go.Panel, "Vertical",
                        new go.Binding("itemArray", "statements"), 
                        {
                            row: 1, columnSpan: 5, stretch: go.GraphObject.Fill, // TODO increase the column span if you add more columns up top
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
                    fromSpot: go.Spot.AllSides,
                    toSpot: go.Spot.AllSides
                },
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
                nodeDataArray={this.props.nodeDateArray}
                linkDataArray={this.props.linkDataArray}
                modelData={this.props.modelData}
                onModelChange={() => {console.log('for now, we do nothing when model changes')}}
                skipsDiagramUpdate={this.props.skipsDiagramUpdate}
            />
        )
    }
}

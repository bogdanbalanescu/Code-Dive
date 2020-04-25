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
                    model: $(go.GraphLinksModel),
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

        const filterViewableAccessModifiers = (accessModifiers: string[]) => {
            var x = accessModifiers.filter((modifier: string) => {
                return ["public", "private", "protected", "internal"].includes(modifier);
            })
            return x;
        }

        // access modifier template
        var accessModifierTemplate = 
            $(go.Panel, "Horizontal",
                { margin: new go.Margin(0, 5, 0, 0) },
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
            $(go.Panel, "Horizontal",
                // field visibility access modifiers
                $(go.Panel, "Horizontal",
                    new go.Binding("itemArray", "accessModifiers", filterViewableAccessModifiers),
                    {
                        row: 1, stretch: go.GraphObject.Fill,
                        defaultAlignment: go.Spot.Left, background: "lightyellow", opacity: 0.75,
                        itemTemplate: accessModifierTemplate
                    }),
                $(go.TextBlock,
                    { isMultiline: false, editable: false },
                    new go.Binding("text", "name"),
                    new go.Binding("isUnderline", "accessModifiers", accessModifiers => accessModifiers.includes("static"))),
                // field type
                $(go.TextBlock,
                    new go.Binding("text", "type", type => `: ${type}` ))
            );

        // property template
        var propertyTemplate = 
        $(go.Panel, "Horizontal",
            // property visibility access modifiers
            $(go.Panel, "Horizontal",
                new go.Binding("itemArray", "accessModifiers", filterViewableAccessModifiers),
                {
                    row: 1, margin: 3, stretch: go.GraphObject.Fill,
                    defaultAlignment: go.Spot.Left, background: "lightyellow",
                    itemTemplate: accessModifierTemplate
                }),
            $(go.TextBlock,
                { isMultiline: false, editable: false },
                new go.Binding("text", "name"),
                new go.Binding("isUnderline", "accessModifiers", accessModifiers => accessModifiers.includes("static"))),
            // property type
            $(go.TextBlock,
                new go.Binding("text", "type", type => `: ${type}` ))
            // TODO: add get and set
            // TODO: add block to be possible for get and set
        );
        
        // class node template
        diagram.nodeTemplate = 
            $(go.Node, "Auto",
                {
                    locationSpot: go.Spot.Center,
                    fromSpot: go.Spot.AllSides,
                    toSpot: go.Spot.AllSides
                },
                $(go.Shape, { fill: "lightyellow" }),
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
                            defaultAlignment: go.Spot.Left, background: "lightyellow",
                            itemTemplate: fieldTemplate
                        }),
                    $("PanelExpanderButton", "FIELDS",
                        { row: 1, column: 1, alignment: go.Spot.TopRight, visible: false},
                        new go.Binding("visible", "fields", fields => fields.length > 0)),
                    // properties
                    // methods
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

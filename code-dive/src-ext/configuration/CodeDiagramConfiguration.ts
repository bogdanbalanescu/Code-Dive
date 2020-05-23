export class CodeDiagramConfiguration {
    public linkCreationConfiguration: LinkCreationConfiguration = new LinkCreationConfiguration();
    public selectionHighlightsConfiguration: SelectionHighlightsConfiguration = new SelectionHighlightsConfiguration();
    public theme: string = "Dark";
    public isLoaded: boolean = false;
}

class LinkCreationConfiguration {
    public linksToSameType: boolean = false;
    public inheritance: boolean = true;
    public memberType: boolean = false;
    public parameterType: boolean = true;
    public variableDeclarationType: boolean = false;
    public usedEnumValues: boolean = true;
    public usedFieldAndProperties: boolean = true;
    public usedConstructorsAndMethods: boolean = true;
}

class SelectionHighlightsConfiguration {
    public recursionDepth: number = 1;
    public includeChildren: boolean = true;
}
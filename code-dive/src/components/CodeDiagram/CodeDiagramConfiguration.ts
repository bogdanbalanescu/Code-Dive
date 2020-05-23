export class CodeDiagramConfiguration {
    linkCreationConfiguration: LinkCreationConfiguration = new LinkCreationConfiguration();
    selectionHighlightsConfiguration: SelectionHighlightsConfiguration = new SelectionHighlightsConfiguration();
    theme: string = "Dark";
    isLoaded: boolean = false;

    public constructor(isLoaded: boolean = false) {
        this.isLoaded = isLoaded;
    }
}

export class LinkCreationConfiguration {
    linksToSameType: boolean = false;
    inheritance: boolean = true;
    memberType: boolean = false;
    parameterType: boolean = true;
    variableDeclarationType: boolean = false;
    usedEnumValues: boolean = true;
    usedFieldAndProperties: boolean = true;
    usedConstructorsAndMethods: boolean = true;
}

export class SelectionHighlightsConfiguration {
    recursionDepth: number = 1;
    includeChildren: boolean = true;
}
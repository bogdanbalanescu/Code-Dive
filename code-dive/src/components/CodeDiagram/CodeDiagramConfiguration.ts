export class CodeDiagramConfiguration {
    linkCreationConfiguration: LinkCreationConfiguration = new LinkCreationConfiguration();
    theme: string = "Dark";
    isLoaded: boolean = false;

    public constructor(isLoaded: boolean = false) {
        this.isLoaded = isLoaded;
    }
}

export class LinkCreationConfiguration {
    public linksToSameType: boolean = false;
    public inheritance: boolean = true;
    public memberType: boolean = false;
    public parameterType: boolean = true;
    public variableDeclarationType: boolean = false;
    public usedEnumValues: boolean = true;
    public usedFieldAndProperties: boolean = true;
    public usedConstructorsAndMethods: boolean = true;
}
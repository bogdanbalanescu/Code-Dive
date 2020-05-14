export class Statement {
    index: number;
    statementText: string;
    usedFieldsAndProperties: string[];
    usedConstructors: string[];
    usedMethods: string[];
    usedTypes: string[];

    public constructor(index: number, statementText: string, usedFieldsAndProperties: string[], usedConstructors: string[], usedMethods: string[], usedTypes: string[]) {
        this.index = index;
        this.statementText = statementText;
        this.usedFieldsAndProperties = usedFieldsAndProperties;
        this.usedConstructors = usedConstructors;
        this.usedMethods = usedMethods;
        this.usedTypes = usedTypes;
    }
}
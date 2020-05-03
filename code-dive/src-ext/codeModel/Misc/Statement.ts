export class Statement {
    statementText: string;
    usedFieldsAndProperties: string[];
    usedConstructors: string[];
    usedMethods: string[];
    usedTypes: string[];

    public constructor(statementText: string, usedFieldsAndProperties: string[], usedConstructors: string[], usedMethods: string[], usedTypes: string[]) {
        this.statementText = statementText;
        this.usedFieldsAndProperties = usedFieldsAndProperties;
        this.usedConstructors = usedConstructors;
        this.usedMethods = usedMethods;
        this.usedTypes = usedTypes;
    }
}
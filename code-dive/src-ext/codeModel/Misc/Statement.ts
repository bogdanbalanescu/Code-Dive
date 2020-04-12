export class Statement {
    statementText: string;
    usedFieldsAndProperties: string[];
    usedConstructors: string[];
    usedMethods: string[];

    public constructor(statementText: string, usedFieldsAndProperties: string[], usedConstructors: string[], usedMethods: string[]) {
        this.statementText = statementText;
        this.usedFieldsAndProperties = usedFieldsAndProperties;
        this.usedConstructors = usedConstructors;
        this.usedMethods = usedMethods;
    }
}
export class Statement {
    index: number;
    statementText: string;
    usedFieldsAndProperties: string[];
    usedConstructors: string[];
    usedMethods: string[];
    usedTypes: string[];

    public constructor(otherStatement: Statement) {
        this.index = otherStatement.index;
        this.statementText = otherStatement.statementText;
        this.usedFieldsAndProperties = otherStatement.usedFieldsAndProperties;
        this.usedConstructors = otherStatement.usedConstructors;
        this.usedMethods = otherStatement.usedMethods;
        this.usedTypes = otherStatement.usedTypes;
    }
}
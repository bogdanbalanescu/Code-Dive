export class Statement {
    index: number;
    statementText: string;
    blockCount: number;
    usedFieldsAndProperties: string[];
    usedConstructors: string[];
    usedMethods: string[];
    usedTypes: string[];

    public constructor(otherStatement: Statement) {
        this.index = otherStatement.index;
        this.statementText = otherStatement.statementText;
        this.blockCount = otherStatement.blockCount;
        this.usedFieldsAndProperties = otherStatement.usedFieldsAndProperties;
        this.usedConstructors = otherStatement.usedConstructors;
        this.usedMethods = otherStatement.usedMethods;
        this.usedTypes = otherStatement.usedTypes;
    }

    mapToSourceCode(): string {
        return `${'\t'.repeat(this.blockCount)}${this.statementText}`;
    }
}
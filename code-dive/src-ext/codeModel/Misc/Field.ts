import { Statement } from "./Statement";

export class Field {
    index: number;
    type: string;
    name: string;
    modifiers: string[];
    assignmentStatement: Statement | undefined;

    public constructor(otherField: Field) {
        this.index = otherField.index;
        this.type = otherField.type;
        this.name = otherField.name;
        this.modifiers = otherField.modifiers;
        this.assignmentStatement = otherField.assignmentStatement ? new Statement(otherField.assignmentStatement): undefined;
    }

    mapToSourceCode(): string {
        return `${this.modifiers.join(' ')} ${this.type} ${this.name} ${this.assignmentStatement ? this.assignmentStatement.mapToSourceCode(): ';'}`;
    }
}
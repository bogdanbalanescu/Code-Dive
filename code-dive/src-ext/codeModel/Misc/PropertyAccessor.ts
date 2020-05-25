import { DeclaredVariable } from './DeclaredVariable';
import { Statement } from "./Statement";

export class PropertyAccessor {
    index: number;
    name: string;
    declaredVariables: DeclaredVariable[];
    body: Statement[];

    public constructor(otherPropertyAccessor: PropertyAccessor) {
        this.index = otherPropertyAccessor.index;
        this.name = otherPropertyAccessor.name;
        this.declaredVariables = otherPropertyAccessor.declaredVariables.map(variable => new DeclaredVariable(variable));
        this.body = otherPropertyAccessor.body.map(statement => new Statement(statement));
    }

    mapToSourceCode(): string {
        return `${this.name} ${this.body.length > 0 ? `{\n${this.body.map(statement => statement.mapToSourceCode()).join('\n')}\n}`: `;`}`
    }
}

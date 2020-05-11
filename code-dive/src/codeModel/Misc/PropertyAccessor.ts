import { DeclaredVariable } from './DeclaredVariable';
import { Statement } from "./Statement";

export class PropertyAccessor {
    name: string;
    declaredVariables: DeclaredVariable[];
    body: Statement[];

    public constructor(name: string, declaredVariables: DeclaredVariable[], body: Statement[]) {
        this.name = name;
        this.declaredVariables = declaredVariables;
        this.body = body;
    }
}

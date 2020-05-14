import { DeclaredVariable } from './DeclaredVariable';
import { Statement } from "./Statement";

export class PropertyAccessor {
    index: number;
    name: string;
    declaredVariables: DeclaredVariable[];
    body: Statement[];

    public constructor(index: number, name: string, declaredVariables: DeclaredVariable[], body: Statement[]) {
        this.index = index;
        this.name = name;
        this.declaredVariables = declaredVariables;
        this.body = body;
    }
}

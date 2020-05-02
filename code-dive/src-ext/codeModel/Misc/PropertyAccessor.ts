import { DeclaredVariable } from './DeclaredVariable';
import { Statement } from "../Misc/Statement";

export class PropertyAccessor {
    type: string;
    declaredVariables: DeclaredVariable[];
    body: Statement[];

    public constructor(type: string, declaredVariables: DeclaredVariable[], body: Statement[]) {
        this.type = type;
        this.declaredVariables = declaredVariables;
        this.body = body;
    }
}

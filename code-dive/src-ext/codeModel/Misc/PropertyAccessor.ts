import { DeclaredVariable } from './DeclaredVariable';
import { Statement } from "./Statement";
import { FixedParameter } from './FixedParameter';

export class PropertyAccessor {
    name: string;
    declaredVariables: DeclaredVariable[];
    parameters: FixedParameter[];
    body: Statement[];

    public constructor(name: string, declaredVariables: DeclaredVariable[], parameters: FixedParameter[], body: Statement[]) {
        this.name = name;
        this.declaredVariables = declaredVariables;
        this.parameters = parameters;
        this.body = body;
    }
}

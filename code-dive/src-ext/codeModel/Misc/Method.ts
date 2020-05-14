import { FixedParameter } from './FixedParameter';
import { DeclaredVariable } from './DeclaredVariable';
import { Statement } from '../Misc/Statement';

export class Method {
    index: number;
    type: string;
    name: string;
    modifiers: string[];
    parameters: FixedParameter[];
    declaredVariables: DeclaredVariable[];
    statements: Statement[];

    public constructor(index: number, type: string, name: string, modifiers: string[], parameters: FixedParameter[], declaredVariables: DeclaredVariable[], statements: Statement[]) {
        this.index = index;
        this.type = type;
        this.name = name;
        this.modifiers = modifiers;
        this.parameters = parameters;
        this.declaredVariables = declaredVariables;
        this.statements = statements;
    }
}
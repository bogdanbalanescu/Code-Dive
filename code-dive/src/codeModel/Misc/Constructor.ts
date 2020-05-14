import { FixedParameter } from './FixedParameter';
import { DeclaredVariable } from './DeclaredVariable';
import { Statement } from '../Misc/Statement';

export class Constructor {
    index: number;
    name: string;
    modifiers: string[];
    parameters: FixedParameter[];
    declaredVariables: DeclaredVariable[];
    statements: Statement[];

    public constructor(index: number, name: string, modifiers: string[], parameters: FixedParameter[], declaredVariables: DeclaredVariable[], statements: Statement[]) {
        this.index = index;
        this.name = name;
        this.modifiers = modifiers;
        this.parameters = parameters;
        this.declaredVariables = declaredVariables;
        this.statements = statements;
    }
}
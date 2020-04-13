import { FixedParameter } from './FixedParameter';
import { DeclaredVariable } from './DeclaredVariable';
import { Statement } from '../Misc/Statement';

export class Constructor {
    name: string;
    modifiers: string[];
    parameters: FixedParameter[];
    declaredVariables: DeclaredVariable[];
    statements: Statement[];

    public constructor(name: string, modifiers: string[], parameters: FixedParameter[], declaredVariables: DeclaredVariable[], statements: Statement[]) {
        this.name = name;
        this.modifiers = modifiers;
        this.parameters = parameters;
        this.declaredVariables = declaredVariables;
        this.statements = statements;
    }
}
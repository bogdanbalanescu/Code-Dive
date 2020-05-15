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

    public constructor(otherMethod: Method) {
        this.index = otherMethod.index;
        this.type = otherMethod.type;
        this.name = otherMethod.name;
        this.modifiers = otherMethod.modifiers;
        this.parameters = otherMethod.parameters.map(parameter => new FixedParameter(parameter));
        this.declaredVariables = otherMethod.declaredVariables.map(variable => new DeclaredVariable(variable));
        this.statements = otherMethod.statements.map(statement => new Statement(statement));
    }
}
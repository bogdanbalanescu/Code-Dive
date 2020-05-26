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

    public constructor(otherConstructor: Constructor) {
        this.index = otherConstructor.index;
        this.name = otherConstructor.name;
        this.modifiers = otherConstructor.modifiers;
        this.parameters = otherConstructor.parameters.map(parameter => new FixedParameter(parameter));
        this.declaredVariables = otherConstructor.declaredVariables.map(variable => new DeclaredVariable(variable));
        this.statements = otherConstructor.statements.map(statement => new Statement(statement));
    }

    mapToSourceCode(): string {
        return [
            `\t\t${this.modifiers.join(' ')}${this.name} (${this.parameters.map(parameter => parameter.mapToSourceCode()).join(', ')})\n`,
            `${this.statements.map(statement => `\t\t${statement.mapToSourceCode()}`).join('\n')}`,
            '\n'
        ].join('');
    }
}
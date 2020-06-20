import { PropertyAccessor } from "./PropertyAccessor";
import { FixedParameter } from './FixedParameter';
import { Statement } from "./Statement";

export class Property {
    index: number;
    type: string;
    name: string;
    modifiers: string[];
    parameters: FixedParameter[];
    accessors: PropertyAccessor[];
    assignmentStatement: Statement | undefined;

    public constructor(otherProperty: Property) {
        this.index = otherProperty.index;
        this.type = otherProperty.type;
        this.name = otherProperty.name;
        this.modifiers = otherProperty.modifiers;
        this.parameters = otherProperty.parameters.map(parameter => new FixedParameter(parameter));
        this.accessors = otherProperty.accessors.map(accessor => new PropertyAccessor(accessor));
        this.assignmentStatement = otherProperty.assignmentStatement ? new Statement(otherProperty.assignmentStatement): undefined;
    }

    mapToSourceCode(): string {
        return [
            `\t\t${this.modifiers.length > 0 ? `${this.modifiers.join(' ')} `: ''}${this.type} ${this.name}${this.parameters.length > 0 ? `[${this.parameters.sort((a, b) => a.index - b.index).map(parameter => parameter.mapToSourceCode()).join(', ')}]`: ''}\n`,
            `\t\t{\n`,
            `${this.accessors.sort((a, b) => a.index - b.index).map(accessor => accessor.mapToSourceCode()).join('')}`,
            `\t\t}\n`,
            `${this.assignmentStatement && this.assignmentStatement.statementText ? `${this.assignmentStatement.mapToSourceCode()};`: ''}\n`,
        ].join('');
    }
}
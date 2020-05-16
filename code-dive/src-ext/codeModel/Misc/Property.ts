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
}
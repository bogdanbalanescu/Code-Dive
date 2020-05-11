import { PropertyAccessor } from "./PropertyAccessor";
import { FixedParameter } from './FixedParameter';

export class Property {
    type: string;
    name: string;
    modifiers: string[];
    parameters: FixedParameter[];
    accessors: PropertyAccessor[];

    public constructor(type: string, name: string, modifiers: string[], parameters: FixedParameter[], accessors: PropertyAccessor[]) {
        this.type = type;
        this.name = name;
        this.modifiers = modifiers;
        this.parameters = parameters;
        this.accessors = accessors;
    }
}
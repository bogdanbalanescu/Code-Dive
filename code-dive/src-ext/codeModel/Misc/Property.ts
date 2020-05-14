import { PropertyAccessor } from "./PropertyAccessor";
import { FixedParameter } from './FixedParameter';

export class Property {
    index: number;
    type: string;
    name: string;
    modifiers: string[];
    parameters: FixedParameter[];
    accessors: PropertyAccessor[];

    public constructor(index: number, type: string, name: string, modifiers: string[], parameters: FixedParameter[], accessors: PropertyAccessor[]) {
        this.index = index;
        this.type = type;
        this.name = name;
        this.modifiers = modifiers;
        this.parameters = parameters;
        this.accessors = accessors;
    }
}
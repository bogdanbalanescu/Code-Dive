import { PropertyAccessor } from "./PropertyAccessor";

export class Property {
    type: string;
    name: string;
    modifiers: string[];
    accessors: PropertyAccessor[];

    public constructor(type: string, name: string, modifiers: string[], accessors: PropertyAccessor[]) {
        this.type = type;
        this.name = name;
        this.modifiers = modifiers;
        this.accessors = accessors;
    }
}
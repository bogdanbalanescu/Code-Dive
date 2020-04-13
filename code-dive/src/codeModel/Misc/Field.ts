export class Field {
    type: string;
    name: string;
    modifiers: string[];

    public constructor(type: string, name: string, modifiers: string[]) {
        this.type = type;
        this.name = name;
        this.modifiers = modifiers;
    }
}
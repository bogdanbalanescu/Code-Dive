export class Field {
    index: number;
    type: string;
    name: string;
    modifiers: string[];

    public constructor(index: number, type: string, name: string, modifiers: string[]) {
        this.index = index;
        this.type = type;
        this.name = name;
        this.modifiers = modifiers;
    }
}
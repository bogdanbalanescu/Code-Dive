export class Field {
    index: number;
    type: string;
    name: string;
    modifiers: string[];

    public constructor(otherField: Field) {
        this.index = otherField.index;
        this.type = otherField.type;
        this.name = otherField.name;
        this.modifiers = otherField.modifiers;
    }
}
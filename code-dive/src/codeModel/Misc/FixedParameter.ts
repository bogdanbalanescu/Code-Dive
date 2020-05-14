export class FixedParameter {
    index: number;
    type: string;
    name: string;
    modifier: string;

    public constructor(index: number, type: string, name: string, modifier: string) {
        this.index = index;
        this.type = type;
        this.name = name;
        this.modifier = modifier;
    }
}
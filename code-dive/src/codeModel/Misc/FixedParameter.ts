export class FixedParameter {
    type: string;
    name: string;
    modifier: string;

    public constructor(type: string, name: string, modifier: string) {
        this.type = type;
        this.name = name;
        this.modifier = modifier;
    }
}
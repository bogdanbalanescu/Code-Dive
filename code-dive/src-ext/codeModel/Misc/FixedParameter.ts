export class FixedParameter {
    index: number;
    type: string;
    name: string;
    modifier: string;

    public constructor(otherFixedParameter: FixedParameter) {
        this.index = otherFixedParameter.index;
        this.type = otherFixedParameter.type;
        this.name = otherFixedParameter.name;
        this.modifier = otherFixedParameter.modifier;
    }
}
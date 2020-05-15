export class EnumValue {
    index: number;
    name: string;

    public constructor(otherEnumValue: EnumValue) {
        this.index = otherEnumValue.index;
        this.name = otherEnumValue.name;
    }
}
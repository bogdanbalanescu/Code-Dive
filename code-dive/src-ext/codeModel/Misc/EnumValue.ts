export class EnumValue {
    index: number;
    name: string;

    public constructor(otherEnumValue: EnumValue) {
        this.index = otherEnumValue.index;
        this.name = otherEnumValue.name;
    }

    mapToSourceCode(): string {
        return `\t\t${this.name}`;
    }
}
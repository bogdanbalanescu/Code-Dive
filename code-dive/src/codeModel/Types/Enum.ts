import { IType } from './IType';
import { EnumValue } from '../Misc/EnumValue';

export class Enum implements IType {
    sourceFilePath: string = "";

    namespaceDependecies: string[];
    namespace: string;
    name: string;
    modifiers: string[];
    parentInheritances: string[];

    values: EnumValue[];

    isUpToDate: boolean;

    public constructor(otherEnum: Enum) {
        this.sourceFilePath = otherEnum.sourceFilePath || "";

        this.namespaceDependecies = otherEnum.namespaceDependecies;
        this.namespace = otherEnum.namespace;
        this.name = otherEnum.name;
        this.modifiers = otherEnum.modifiers;
        this.parentInheritances = otherEnum.parentInheritances;

        this.values = otherEnum.values.map(value => new EnumValue(value));

        this.isUpToDate = otherEnum.isUpToDate;
    }

    public setSourceFilePath(sourceFilePath: string): void {
        this.sourceFilePath = sourceFilePath;
    }
}
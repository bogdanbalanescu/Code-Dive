import { IType } from './IType';

export class Enum implements IType {
    sourceFilePath: string = "";

    namespaceDependecies: string[];
    namespace: string;
    name: string;
    modifiers: string[];
    parentInheritances: string[];

    values: string[];

    public constructor(otherEnum: Enum) {
        this.sourceFilePath = otherEnum.sourceFilePath || "";

        this.namespaceDependecies = otherEnum.namespaceDependecies;
        this.namespace = otherEnum.namespace;
        this.name = otherEnum.name;
        this.modifiers = otherEnum.modifiers;
        this.parentInheritances = otherEnum.parentInheritances;

        this.values = otherEnum.values;
    }

    public setSourceFilePath(sourceFilePath: string): void {
        this.sourceFilePath = sourceFilePath;
    }
}
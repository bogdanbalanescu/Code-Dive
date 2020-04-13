import { IType } from './IType';

export class Enum implements IType {
    sourceFilePath: string = "";

    namespaceDependecies: string[];
    namespace: string;
    name: string;
    modifiers: string[];
    parentInheritances: string[];

    values: string[];

    public constructor(namespaceDependecies: string[], namespace: string, name: string, modifiers: string[], parentInheritances: string[],
        values: string[]) {
        
        this.namespaceDependecies = namespaceDependecies;
        this.namespace = namespace;
        this.name = name;
        this.modifiers = modifiers;
        this.parentInheritances = parentInheritances;

        this.values = values;
    }

    public setSourceFilePath(sourceFilePath: string): void {
        this.sourceFilePath = sourceFilePath;
    }
}
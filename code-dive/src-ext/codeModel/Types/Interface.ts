import { IType } from './IType';
import { Property } from '../Misc/Property';
import { Method } from '../Misc/Method';

export class Interface implements IType {
    sourceFilePath: string = "";

    namespaceDependecies: string[];
    namespace: string;
    name: string;
    modifiers: string[];
    parentInheritances: string[];

    properties: Property[];
    methods: Method[];

    public constructor(namespaceDependecies: string[], namespace: string, name: string, modifiers: string[], parentInheritances: string[],
        properties: Property[], methods: Method[]) {
        
        this.namespaceDependecies = namespaceDependecies;
        this.namespace = namespace;
        this.name = name;
        this.modifiers = modifiers;
        this.parentInheritances = parentInheritances;

        this.properties = properties;
        this.methods = methods;
    }

    public setSourceFilePath(sourceFilePath: string): void {
        this.sourceFilePath = sourceFilePath;
    }
}
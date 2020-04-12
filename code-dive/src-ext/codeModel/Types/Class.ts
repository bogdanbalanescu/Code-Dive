import { IType } from './IType';
import { Field } from '../Misc/Field';
import { Property } from '../Misc/Property';
import { Constructor } from '../Misc/Constructor';
import { Method } from '../Misc/Method';

export class Class implements IType {
    sourceFilePath: string = "";

    namespaceDependecies: string[];
    namespace: string;
    name: string;
    modifiers: string[];
    parentInheritances: string[];

    fields: Field[];
    properties: Property[];
    constructors: Constructor[];
    methods: Method[];

    public constructor(namespaceDependecies: string[], namespace: string, name: string, modifiers: string[], parentInheritances: string[],
        fields: Field[], properties: Property[], constructors: Constructor[], methods: Method[]) {
        
        this.namespaceDependecies = namespaceDependecies;
        this.namespace = namespace;
        this.name = name;
        this.modifiers = modifiers;
        this.parentInheritances = parentInheritances;

        this.fields = fields;
        this.properties = properties;
        this.constructors = constructors;
        this.methods = methods;
    }

    public setSourceFilePath(sourceFilePath: string): void {
        this.sourceFilePath = sourceFilePath;
    }
}
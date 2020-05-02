import { IType } from './IType';
import { Field } from '../Misc/Field';
import { Property } from '../Misc/Property';
import { Constructor } from '../Misc/Constructor';
import { Method } from '../Misc/Method';

export class Struct implements IType {
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

    public constructor(otherStruct: Struct) {
        this.sourceFilePath = otherStruct.sourceFilePath || "";
        
        this.namespaceDependecies = otherStruct.namespaceDependecies;
        this.namespace = otherStruct.namespace;
        this.name = otherStruct.name;
        this.modifiers = otherStruct.modifiers;
        this.parentInheritances = otherStruct.parentInheritances;

        this.fields = otherStruct.fields;
        this.properties = otherStruct.properties;
        this.constructors = otherStruct.constructors;
        this.methods = otherStruct.methods;
    }

    public setSourceFilePath(sourceFilePath: string): void {
        this.sourceFilePath = sourceFilePath;
    }
}
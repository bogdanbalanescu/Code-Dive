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

    isUpToDate: boolean;

    public constructor(otherStruct: Struct) {
        this.sourceFilePath = otherStruct.sourceFilePath || "";
        
        this.namespaceDependecies = otherStruct.namespaceDependecies;
        this.namespace = otherStruct.namespace;
        this.name = otherStruct.name;
        this.modifiers = otherStruct.modifiers;
        this.parentInheritances = otherStruct.parentInheritances;

        this.fields = otherStruct.fields.map(field => new Field(field));
        this.properties = otherStruct.properties.map(property => new Property(property));
        this.constructors = otherStruct.constructors.map(constructor => new Constructor(constructor));
        this.methods = otherStruct.methods.map(method => new Method(method));

        this.isUpToDate = otherStruct.isUpToDate;
    }
}
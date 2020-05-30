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

    isUpToDate: boolean;

    public constructor(otherClass: Class) {
        this.sourceFilePath = otherClass.sourceFilePath || "";
        
        this.namespaceDependecies = otherClass.namespaceDependecies;
        this.namespace = otherClass.namespace;
        this.name = otherClass.name;
        this.modifiers = otherClass.modifiers;
        this.parentInheritances = otherClass.parentInheritances;

        this.fields = otherClass.fields.map(field => new Field(field));
        this.properties = otherClass.properties.map(property => new Property(property));
        this.constructors = otherClass.constructors.map(constructor => new Constructor(constructor));
        this.methods = otherClass.methods.map(method => new Method(method));

        this.isUpToDate = otherClass.isUpToDate;
    }

    public setSourceFilePath(sourceFilePath: string): void {
        this.sourceFilePath = sourceFilePath;
    }
}
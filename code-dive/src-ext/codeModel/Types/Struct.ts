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

    public setSourceFilePath(sourceFilePath: string): void {
        this.sourceFilePath = sourceFilePath;
    }

    public setIsUpdateToDate(isUpToDate: boolean): void {
        this.isUpToDate = isUpToDate;
    }

    mapToSourceCode(): string {
        return [
            `${this.namespaceDependecies.map(namespace => `using ${namespace};`).join('\n')}\n\n`,
            `namespace ${this.namespace}\n`,
            `{\n`,
            `\t${this.modifiers.length > 0 ? `${this.modifiers.join(' ')} `: ''}struct ${this.name} ${this.parentInheritances.length > 0 ? `: ${this.parentInheritances.join(', ')}`: ''}\n`,
            `\t{\n`,
                `${this.fields.map(member => member.mapToSourceCode()).join('')}`,
                `${this.properties.map(member => member.mapToSourceCode()).join('')}`,
                `${this.constructors.map(member => member.mapToSourceCode()).join('')}`,
                `${this.methods.map(member => member.mapToSourceCode()).join('')}`,
            '\t}\n',
            '}\n',
        ].join('');
    }
}
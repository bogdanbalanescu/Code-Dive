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

    public setIsUpdateToDate(isUpToDate: boolean): void {
        this.isUpToDate = isUpToDate;
    }

    mapToSourceCode(): string {
        return [
            `${this.namespaceDependecies.map(namespace => `using ${namespace};`).join('\n')}\n\n`,
            `namespace ${this.namespace}\n`,
            `{\n`,
            `\t${this.modifiers.length > 0 ? `${this.modifiers.join(' ')} `: ''}class ${this.name} ${this.parentInheritances.length > 0 ? `: ${this.parentInheritances.join(', ')}`: ''}\n`,
            `\t{\n`,
                `${this.fields.sort((a, b) => a.index - b.index).map(member => member.mapToSourceCode()).join('')}`,
                `${this.properties.sort((a, b) => a.index - b.index).map(member => member.mapToSourceCode()).join('')}`,
                `${this.constructors.sort((a, b) => a.index - b.index).map(member => member.mapToSourceCode()).join('')}`,
                `${this.methods.sort((a, b) => a.index - b.index).map(member => member.mapToSourceCode()).join('')}`,
            '\t}\n',
            '}\n',
        ].join('');
    }
}
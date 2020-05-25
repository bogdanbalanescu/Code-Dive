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

    public constructor(otherInterface: Interface) {
        this.sourceFilePath = otherInterface.sourceFilePath || "";
        
        this.namespaceDependecies = otherInterface.namespaceDependecies;
        this.namespace = otherInterface.namespace;
        this.name = otherInterface.name;
        this.modifiers = otherInterface.modifiers;
        this.parentInheritances = otherInterface.parentInheritances;

        this.properties = otherInterface.properties.map(property => new Property(property));
        this.methods = otherInterface.methods.map(method => new Method(method));
    }

    public setSourceFilePath(sourceFilePath: string): void {
        this.sourceFilePath = sourceFilePath;
    }

    mapToSourceCode(): string {
        return [
            `${this.namespaceDependecies.map(namespace => `using ${namespace};`).join('\n')}\n\n`,
            `namespace ${this.namespace}\n`,
            `{\n`,
            `\t${this.modifiers.length > 0 ? `${this.modifiers.join(' ')} `: ''}interface ${this.name} ${this.parentInheritances.length > 0 ? `: ${this.parentInheritances.join(', ')}`: ''}\n`,
            `\t{\n`,
                `${this.properties.map(member => member.mapToSourceCode()).join('\n')}`,
                `${this.methods.map(member => member.mapToSourceCode()).join('\n')}`,
            '\t}\n',
            '}\n',
        ].join('');
    }
}
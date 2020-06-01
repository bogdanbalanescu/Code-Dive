import { Class } from "./Types/Class";
import { Struct } from "./Types/Struct";
import { Interface } from "./Types/Interface";
import { Enum } from "./Types/Enum";

export class ParsedTypes {
    classes: Class[];
    structs: Struct[];
    interfaces: Interface[];
    enums: Enum[];

    public constructor(classes: Class[], structs: Struct[], interfaces: Interface[], enums: Enum[]) {
        this.classes = classes.map(type => new Class(type));
        this.structs = structs.map(type => new Struct(type));
        this.interfaces = interfaces.map(type => new Interface(type));
        this.enums = enums.map(type => new Enum(type)); 
    }

    public addClasses(classes: Class[]): void {
        if (classes.length) this.classes = this.classes.concat(classes);
    }

    public addStructs(structs: Struct[]): void {
        if (structs.length) this.structs = this.structs.concat(structs);
    }

    public addInterfaces(interfaces: Interface[]): void {
        if (interfaces.length) this.interfaces = this.interfaces.concat(interfaces);
    }

    public addEnums(enums: Enum[]): void {
        if (enums.length) this.enums = this.enums.concat(enums);
    }

    public count(): number {
        return this.classes.length + this.structs.length + this.interfaces.length + this.enums.length;
    }

	setSourceFilePath(filePath: string) {
        this.classes.forEach(type => type.setSourceFilePath(filePath));
        this.structs.forEach(type => type.setSourceFilePath(filePath));
        this.interfaces.forEach(type => type.setSourceFilePath(filePath));
        this.enums.forEach(type => type.setSourceFilePath(filePath));
    }

    setIsUpdateToDate(isUpToDate: boolean) {
        this.classes.forEach(type => type.setIsUpdateToDate(isUpToDate));
        this.structs.forEach(type => type.setIsUpdateToDate(isUpToDate));
        this.interfaces.forEach(type => type.setIsUpdateToDate(isUpToDate));
        this.enums.forEach(type => type.setIsUpdateToDate(isUpToDate));
    }
    
	mapToSourceCode(): string {
        return [
            this.classes.map(type => type.mapToSourceCode()).join(''),
            this.structs.map(type => type.mapToSourceCode()).join(''),
            this.interfaces.map(type => type.mapToSourceCode()).join(''),
            this.enums.map(type => type.mapToSourceCode()).join(''),
        ].join('\n');
	}
}
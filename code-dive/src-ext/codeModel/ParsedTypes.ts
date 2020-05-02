import { Class } from "./Types/Class";
import { Struct } from "./Types/Struct";
import { Interface } from "readline";
import { Enum } from "./Types/Enum";

export class ParsedTypes {
    classes: Class[];
    structs: Struct[];
    interfaces: Interface[];
    enums: Enum[];

    public constructor(classes: Class[], structs: Struct[], interfaces: Interface[], enums: Enum[]) {
        this.classes = classes;
        this.structs = structs;
        this.interfaces = interfaces;
        this.enums = enums;        
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
}
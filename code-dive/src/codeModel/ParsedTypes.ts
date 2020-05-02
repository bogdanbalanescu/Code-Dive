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
        this.classes = classes;
        this.structs = structs;
        this.interfaces = interfaces;
        this.enums = enums;        
    }
}
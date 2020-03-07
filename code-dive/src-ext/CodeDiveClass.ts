export class Namespace {
    public name: string;
    public constructor(name:string) {
        this.name = name;
    }
}
export class NamespaceDependency {
    public namespace: Namespace;
    public constructor(namespace:Namespace) {
        this.namespace = namespace;
    }
}
export class Type {
    public name: string;
    public constructor(name: string) {
        this.name = name;
    }
}
export class Field {
    public name: string;
    public type: Type;
    public constructor(name:string, type:Type) {
        this.name = name;
        this.type = type;
    }
}
export class Property {
    public name: string;
    public type: Type;
    // TODO: differentiate between having both get and set (or just one of the two)
    public constructor(name:string, type:Type) {
        this.name = name;
        this.type = type;
    }
}
export class Statement {
    public content: string; // TODO: consider changing content to linesOfCode
    public constructor(content: string) {
        this.content = content;
    }
}
export class Argument {
    public name: string;
    public type: Type;
    public constructor(name:string, type:Type) {
        this.name = name;
        this.type = type;
    }
}
export class Method {
    public name: string;
    public arguments: Argument[];
    public type: Type;
    public statements: Statement[];
    public constructor(name:string, args:Argument[], type:Type, statements: Statement[]) {
        this.name = name;
        this.arguments = args ? args : [];
        this.type = type;
        this.statements = statements ? statements : [];
    }
}

export class CodeDiveClass {
    public usingStatements: NamespaceDependency[];
    public namespace: Namespace;
    public name: string;
    public parents: Type[];
    public fields: Field[];
    public properties: Property[];
    public methods: Method[];
    public constructor(usingStatements: NamespaceDependency[], namespace: Namespace, name: string, parents: Type[], fields: Field[], properties: Property[], methods: Method[]) {
        this.usingStatements = usingStatements ? usingStatements : [];
        this.namespace = namespace;
        this.name = name;
        this.parents = parents ? parents : [];
        this.fields = fields ? fields : [];
        this.properties = properties ? properties : [];
        this.methods = methods ? methods : [];
    }
}
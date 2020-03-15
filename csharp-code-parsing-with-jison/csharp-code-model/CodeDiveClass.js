export class Namespace {
    name;
    constructor(name) {
        this.name = name;
    }
}
export class NamespaceDependency {
    namespace;
    constructor(namespace) {
        this.namespace = namespace;
    }
}
export class Type {
    name;
    constructor(name) {
        this.name = name;
    }
}
export class Field {
    name;
    type;
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
}
export class Property {
    name;
    type;
    // TODO: differentiate between having both get and set (or just one of the two)
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
}
export class Statement {
    content; // TODO: consider changing content to linesOfCode
    constructor(content) {
        this.content = content;
    }
}
export class Argument {
    name;
    type;
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
}
export class Method {
    name;
    arguments;
    type;
    statements;
    constructor(name, args, type, statements) {
        this.name = name;
        this.arguments = args ? args : [];
        this.type = type;
        this.statements = statements ? statements : [];
    }
}

export class CodeDiveClass {
    usingStatements;
    namespace;
    name;
    parents;
    fields;
    properties;
    methods;
    constructor(usingStatements, namespace, name, parents, fields, properties, methods) {
        this.usingStatements = usingStatements ? usingStatements : [];
        this.namespace = namespace;
        this.name = name;
        this.parents = parents ? parents : [];
        this.fields = fields ? fields : [];
        this.properties = properties ? properties : [];
        this.methods = methods ? methods : [];
    }
}
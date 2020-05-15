export class DeclaredVariable {
    type: string;
    name: string;

    public constructor(otherDeclaredVariable: DeclaredVariable) {
        this.type = otherDeclaredVariable.type;
        this.name = otherDeclaredVariable.name;
    }
}
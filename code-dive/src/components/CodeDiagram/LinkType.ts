export enum LinkType {
    // Inheritance
    Realization = "Realization",
    Generalization = "Generalization",
    // Used Types
    MemberType = "CallableReturnType",
    ParameterType = "ParameterType",
    StatementUsesType = "StatementUsesType",
    // Used Fields, Properties, Constructors and Methods
    StatementUsesConstructorOrMethod = "StatementUsesConstructorOrMethod",
    StatementUsesFieldOrProperty = "StatementUsesFieldOrProperty",
    StatementUsesEnumValue = "StatementUsesEnumValue"
}